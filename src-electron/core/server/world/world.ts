import { Failable, isFailure, isSuccess } from 'src-electron/api/failable';
import { ServerProperties, World, WorldAbbr } from 'src-electron/api/schema';
import { Path } from '../../utils/path/path';
import { asyncMap } from '../../utils/objmap';
import { getWorldJsonPath, loadWorldJson } from './worldJson';
import { getRemoteWorld } from '../remote/remote';
import { BytesData } from '../../utils/bytesData/bytesData';
import { LEVEL_NAME } from '../const';
import { parseServerProperties } from '../settings/properties';

// TODO: datapacks/plugins/modsの読み込み

export async function getWorldAbbrs(
  worldContainer: string
): Promise<Failable<WorldAbbr[]>> {
  const subdir = await new Path(worldContainer).iter();
  const results = await asyncMap(subdir, (x) =>
    getWorldAbbr(x, worldContainer)
  );
  return results.filter(isSuccess);
}

export async function getWorldAbbr(
  path: Path,
  worldContainer: string
): Promise<Failable<WorldAbbr>> {
  if (!path.isDirectory()) return new Error(`${path.str()} is not directory.`);
  const jsonpath = getWorldJsonPath(path);

  if (!jsonpath.exists()) return new Error(`${jsonpath.str()} not exists.`);

  const result: WorldAbbr = {
    name: path.basename(),
    container: worldContainer,
  };
  return result;
}

export async function getWorld(
  name: string,
  container: string
): Promise<Failable<World>> {
  const cwd = new Path(container).child(name);

  const settings = await loadWorldJson(cwd);
  if (isFailure(settings)) return settings;

  // リモートが存在する場合リモートからデータを取得
  if (settings.remote !== undefined) {
    return await getRemoteWorld(name, container, settings.remote);
  }

  // リモートが存在しない場合ローカルのデータを使用

  // アバターの読み込み
  const avater_path = await getIconURI(cwd);

  // server.propertiesの取得
  const properties = await getServerProperties(cwd);

  const world: World = {
    name,
    container,
    avater_path,
    settings,
    properties,
    additional: {},
  };
  return world;
}

async function getIconURI(cwd: Path) {
  let iconURI: string | undefined = undefined;
  const iconpath = cwd.child(LEVEL_NAME + '/icon.png');
  if (iconpath.exists()) {
    const data = await BytesData.fromPath(iconpath);
    if (isSuccess(data)) {
      iconURI = await data.encodeURI('image/png');
    }
  }
  return iconURI;
}

async function getServerProperties(cwd: Path) {
  let propertiesPath = cwd.child('server.properties');
  let properties: ServerProperties | undefined = undefined;
  if (isSuccess(propertiesPath)) {
    const propertiesText = await propertiesPath.readText();
    if (isSuccess(propertiesText)) {
      properties = await parseServerProperties(propertiesText);
    }
  }
  return properties;
}

// const demoWorldSettings: WorldSettings = {
//   avater_path: 'https://cdn.quasar.dev/img/parallax2.jpg',
//   version: {
//     id: '1.19.2',
//     type: 'vanilla',
//     release: true,
//   },
// };
