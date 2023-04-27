import { PapermcVersion } from 'src-electron/api/schema';
import { Failable, isFailure, isSuccess } from '../../api/failable';
import { BytesData } from '../../util/bytesData';
import { getJavaComponent } from './vanilla';
import { versionsCachePath } from '../const';
import { VersionLoader, genGetAllVersions } from './base';
import { Path } from '../../util/path';

const papermcVersionsPath = versionsCachePath.child('papermc');

type PapermcVersions = {
  project_id: 'paper';
  project_name: 'Paper';
  version_groups: string[];
  versions: string[];
};

type PapermcBuilds = {
  project_id: 'paper';
  project_name: 'Paper';
  version: string;
  builds: {
    build: number;
    downloads: {
      application: {
        name: 'paper-1.19.3-368.jar';
      };
    };
  }[];
};

export const papermcVersionLoader: VersionLoader<PapermcVersion> = {
  /** papermcのサーバーデータを必要があればダウンロード */
  readyVersion: readyVersion,

  /** papermcのバージョンの一覧返す */
  getAllVersions: genGetAllVersions('papermc', getPapermcVersions),
};

async function getPapermcVersions(): Promise<Failable<PapermcVersion[]>> {
  const VERSION_LIST_URL = 'https://api.papermc.io/v2/projects/paper';
  const data = await BytesData.fromURL(VERSION_LIST_URL);
  if (isFailure(data)) return data;

  const json = await data.json<PapermcVersions>();
  if (isFailure(json)) return json;

  const promisses = json.versions.reverse().map(getPapermcBuilds);

  const results = await Promise.all(promisses);

  return results.filter(isSuccess).flatMap((x) => x);
}

type ApiBuilds = {
  project_id: 'paper';
  project_name: 'Paper';
  version: string;
  builds: number[];
};

async function getPapermcBuilds(
  version: string
): Promise<Failable<PapermcVersion[]>> {
  const url = `https://api.papermc.io/v2/projects/paper/versions/${version}`;
  const data = await BytesData.fromURL(url);
  if (isFailure(data)) return data;

  const json = await data.json<ApiBuilds>();
  if (isFailure(json)) return json;

  return json.builds.map((build) => ({ id: version, type: 'papermc', build }));
}

type ApiBuild = {
  project_id: 'paper';
  project_name: 'Paper';
  version: string;
  build: number;
  time: string;
  channel: 'default';
  promoted: boolean;
  downloads: {
    application: {
      name: string;
      sha256: string;
    };
  };
};

async function readyVersion(version: PapermcVersion, cwdPath: Path) {
  const jarpath = cwdPath.child(
    `${version.type}-${version.id}-${version.build}.jar`
  );

  const buildURL = `https://api.papermc.io/v2/projects/paper/versions/${version.id}/builds/${version.build}`;
  const jsonpath = papermcVersionsPath.child(
    `${version.id}/${version.build}.json`
  );
  const jsonResponse = await BytesData.fromPathOrUrl(
    jsonpath,
    buildURL,
    undefined,
    true,
    true,
    undefined
  );
  if (isFailure(jsonResponse)) return jsonResponse;

  const json = await jsonResponse.json<ApiBuild>();
  if (isFailure(json)) return json;

  const { name, sha256 } = json.downloads.application;

  const jarURL = buildURL + `/downloads/${name}`;

  const jarResponse = await BytesData.fromPathOrUrl(
    jarpath,
    jarURL,
    { type: 'sha256', value: sha256 },
    false,
    true,
    undefined
  );
  if (isFailure(jarResponse)) return jarResponse;

  // 適切なjavaのバージョンを取得
  const component = await getJavaComponent(version.id);
  if (isFailure(component)) return component;

  return {
    programArguments: ['-jar', '"' + jarpath.absolute().str() + '"'],
    component,
  };
}

async function downloadPapermcVersion(version: PapermcVersion, jarpath: Path) {
  const buildsURL = `https://api.papermc.io/v2/projects/paper/versions/${version.id}/builds`;

  const response = await BytesData.fromURL(buildsURL);
  if (isFailure(response)) return response;

  const buildsJson = await response.json<PapermcBuilds>();
  if (isFailure(buildsJson)) return buildsJson;

  const build = buildsJson.builds[buildsJson.builds.length - 1];

  const build_id = build.build;

  const build_file = build.downloads.application.name;

  const serverURL = `https://api.papermc.io/v2/projects/paper/versions/${version.id}/builds/${build_id}/downloads/${build_file}`;

  const server = await BytesData.fromURL(serverURL);
  if (isFailure(server)) return server;

  // jarファイルを保存
  jarpath.write(server);
}