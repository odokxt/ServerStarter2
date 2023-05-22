import {
  Failable,
  failabilify,
  isFailure,
  isSuccess,
  runOnSuccess,
} from 'src-electron/api/failable';
import { Path } from '../../util/path';
import { asyncMap } from '../../util/objmap';
import { getWorldJsonPath, loadWorldJson } from '../settings/worldJson';
import { BytesData } from '../../util/bytesData';
import { LEVEL_NAME } from '../const';
import { getRemoteWorld } from '../remote/remote';
import { worldContainerToPath } from './worldContainer';
import { worldSettingsToWorld } from '../settings/converter';
import { World, WorldAbbr, WorldID } from 'src-electron/schema/world';
import { genUUID } from 'app/src-electron/tools/uuid';
import { WorldLocationMap, wroldLocationToPath } from './worldMap';
import { WorldContainer, WorldName } from 'app/src-electron/schema/brands';

export async function deleteWorld(worldID: WorldID) {
  const cwd = runOnSuccess(wroldLocationToPath)(WorldLocationMap.get(worldID));
  if (isFailure(cwd)) return cwd;

  const result = await failabilify(cwd.remove)();
  if (isFailure(result)) return result;

  WorldLocationMap.delete(worldID);
  return;
}

export async function getWorldAbbrs(
  worldContainer: WorldContainer
): Promise<Failable<WorldAbbr[]>> {
  const subdir = await worldContainerToPath(worldContainer).iter();
  const results = await asyncMap(subdir, (x) =>
    getWorldAbbr(x, worldContainer)
  );
  return results.filter(isSuccess);
}

export async function getWorldAbbr(
  path: Path,
  worldContainer: WorldContainer
): Promise<Failable<WorldAbbr>> {
  if (!path.isDirectory()) return new Error(`${path.str()} is not directory.`);
  const jsonpath = getWorldJsonPath(path);

  if (!jsonpath.exists()) return new Error(`${jsonpath.str()} not exists.`);

  const id = genUUID() as WorldID;
  const name = path.basename() as WorldName;
  const container = worldContainer as WorldContainer;
  const result: WorldAbbr = {
    id,
    name,
    container,
  };
  WorldLocationMap.set(id, { name, container });
  return result;
}

export async function getWorld(worldID: WorldID): Promise<Failable<World>> {
  const location = WorldLocationMap.get(worldID);
  if (isFailure(location)) return location;
  const { name, container } = location;

  const cwd = wroldLocationToPath(location);
  if (isFailure(cwd)) return cwd;

  const settings = await loadWorldJson(cwd);
  if (isFailure(settings)) return settings;

  // リモートが存在する場合リモートからデータを取得
  if (settings.remote !== undefined) {
    const result = await getRemoteWorld(worldID, settings.remote);
    return result;
  }

  // リモートが存在しない場合ローカルのデータを使用

  // アバターの読み込み
  const avater_path = await getIconURI(cwd);

  settings.properties ?? {};
  const world = worldSettingsToWorld({
    id: worldID,
    name,
    container,
    avater_path,
    settings,
  });
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

// const demoWorldSettings: WorldSettings = {
//   avater_path: 'https://cdn.quasar.dev/img/parallax2.jpg',
//   version: {
//     id: '1.19.2',
//     type: 'vanilla',
//     release: true,
//   },
// };
