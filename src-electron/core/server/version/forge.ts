import { ForgeVersion } from 'app/src-electron/api/scheme';
import { VersionLoader } from './interface';
import { Failable, isFailure } from '../../../api/failable';
import { Path } from '../../utils/path/path';
import { getJavaComponent } from './vanilla';
import { BytesData } from '../../utils/bytesData/bytesData';
import * as cheerio from 'cheerio';
import { versionsPath } from '../const';
import { interactiveProcess } from '../../utils/subprocess';
import { readyJava } from '../../utils/java/java';
import { osPlatform } from '../../utils/os/os';

const forgeVersionsPath = versionsPath.child('forge');

const ForgeURL = 'https://files.minecraftforge.net/net/minecraftforge/forge/';

export const forgeVersionLoader: VersionLoader = {
  /** forgeのサーバーデータをダウンロード */
  async readyVersion(version: ForgeVersion) {
    // 適切なjavaのバージョンを取得
    const component = await getJavaComponent(version.id);
    if (isFailure(component)) return component;

    const versionPath = forgeVersionsPath.child(version.id);
    const serverCwdPath = versionPath;
    const installerPath = versionPath.child(
      'forge-' + version.id + '-installer.jar'
    );

    // インストーラーのダウンロードURLを取得
    const serverURL = await getForgeDownloadUrl(version);
    if (isFailure(serverURL)) return serverURL;

    // インストーラーを取得
    const serverData = await BytesData.fromURL(serverURL);
    if (isFailure(serverData)) return serverData;

    // インストーラーを保存
    await installerPath.write(serverData);

    // インストーラーを実行
    const installResult = await installForge(installerPath);
    if (isFailure(installResult)) return installResult;

    const programArguments = await getProgramArguments(serverCwdPath);
    if (isFailure(programArguments)) return programArguments;

    return {
      programArguments,
      serverCwdPath,
      component,
    };
  },

  /** forgeのバージョンの一覧返す */
  async getAllVersions() {
    const ids = await getVersionIds();
    if (isFailure(ids)) return ids;
    return ids.map((id) => ({ id, release: true, type: 'forge' }));
  },
};

async function getProgramArguments(serverCwdPath: Path) {
  // 1.17以降はrun.batが生成されるようになるのでその内容を解析して実行時引数を構成
  // TODO: osに応じてrun.shに対応
  if (osPlatform == 'windows-x64') {
    // windows
    const batPath = serverCwdPath.child('run.bat');
    if (batPath.exists()) {
      // 1.17.1以降
      return await getProgramArgumentsFromBat(batPath);
    }
  } else {
    // UNIX(macOS,linux)
    const shPath = serverCwdPath.child('run.sh');
    if (shPath.exists()) {
      // 1.17.1以降
      return await getProgramArgumentsFromSh(shPath);
    }
  }

  for (let file of await serverCwdPath.iter()) {
    const filename = file.basename();

    const match = filename.match(
      /(minecraft)?forge-[0-9\.-]+(-universal)?.jar/
    );
    if (match) {
      return ['-jar', file.str()];
    }
  }

  return new Error(
    `run.bat or run.sh or server jar file is needed in ${serverCwdPath.str()}`
  );
}

async function getProgramArgumentsFromBat(batPath: Path) {
  const data = await batPath.read();
  if (isFailure(data)) return data;

  // バッチフィルの中身を取得
  const txt = await data.text();

  for (let line of txt.split('\n')) {
    const pattern = /^\s*java @user_jvm_args\.txt ([^ ]+) %\*\s*$/;
    const match = line.match(pattern);
    if (match) {
      const arg = match[1];
      return [arg];
    }
  }
  return new Error('missing java command in run.bat file');
}

async function getProgramArgumentsFromSh(shPath: Path) {
  const data = await shPath.read();
  if (isFailure(data)) return data;

  // シェルスクリプトの中身を取得
  const txt = await data.text();

  for (let line of txt.split('\n')) {
    const pattern = /^\s*java @user_jvm_args\.txt ([^ ]+) "\$@"\s*$/;
    const match = line.match(pattern);
    if (match) {
      const arg = match[1];
      return [arg];
    }
  }
  return new Error('missing java command in run.sh file');
}

async function installForge(
  installerPath: Path
): Promise<Failable<number | null>> {
  // TODO: forgeのインストール時に使用するjavaのバージョン17で大丈夫？
  // jre-legacyだとエラー出たのでとりあえずこれを使っている
  const javaPath = await readyJava('java-runtime-gamma', false);
  if (isFailure(javaPath)) return javaPath;

  const args = [
    '-jar',
    '"' + installerPath.absolute().str() + '"',
    '--installServer',
  ];

  console.log(
    javaPath.absolute().str(),
    args,
    installerPath.parent().absolute().str()
  );

  // インストール開始
  // -jar forge-*-installer.jar --installServer server
  const [_, process] = interactiveProcess(
    javaPath.absolute().str(),
    args,
    console.log,
    console.log,
    installerPath.parent().absolute().str(),
    true
  );
  return await process;
}

export async function getForgeDownloadUrl(version: ForgeVersion) {
  const PageURL =
    'https://files.minecraftforge.net/net/minecraftforge/forge/index_' +
    version.id +
    '.html';
  const Page = await BytesData.fromURL(PageURL);
  if (isFailure(Page)) return Page;

  const $ = cheerio.load(await Page.text());

  const AdURL = $('a[title=Installer]').last().attr('href');

  if (AdURL === undefined) {
    console.log($('div.download a').length, version.id);
    return new Error(`failed to fetch forge download URL (${version.id})`);
  }

  const match = AdURL.match(
    /^https:\/\/adfoc.us\/serve\/sitelinks\/\?id=\d+&url=([a-z0-9:\/\._-]+)$/
  );
  if (!match) return new Error(`failed to parse forge download URL (${AdURL})`);

  const serverURL = match[1];
  return serverURL;
}

export async function getVersionIds() {
  const indexPage = await BytesData.fromURL(ForgeURL);

  if (isFailure(indexPage)) return indexPage;

  const $ = cheerio.load(await indexPage.text());

  const ids: string[] = [];

  // TODO: Forgeのhtml構成が変わった瞬間終わるので対策を考えたい
  $('ul.section-content li.li-version-list ul li a').each((_, elem) => {
    const path = elem.attribs['href'];
    const match = path.match(/^index_([a-z0-9_\.-]+)\.html$/);
    console.group(path, match);
    if (match) ids.push(match[1]);
  });
  console.log(ids);

  return ids;
}