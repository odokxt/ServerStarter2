import {
  SystemWorldSettings,
  World,
  WorldSettings,
} from 'src-electron/api/schema';
import {
  defaultServerProperties,
  mergeServerProperties,
  stringifyServerProperties,
} from './properties';
import { Path } from '../../util/path';
import { SETTINGS_KEY, serverStarterSetting } from '../stores/setting';

/** サーバー設定系ファイルをサーバーCWD直下に書き出す */
export async function unrollSettings(
  world: World,
  levelName: string,
  serverCwdPath: Path
) {
  // server.properties を書き出し
  const strprop = stringifyServerProperties({
    ...(world.properties ?? defaultServerProperties),
    'level-name': { type: 'string', value: levelName },
  });
  serverCwdPath.child('server.properties').writeText(strprop);
}

// Javaの-Xmx,-Xmsのデフォルト値(Gb)
const DEFAULT_JAVA_HEAP_SIZE = 2;

// ワールド設定のデフォルト値を取得
export async function getDefaultSettings(): Promise<SystemWorldSettings> {
  const settings = serverStarterSetting.get(SETTINGS_KEY);

  const properties = mergeServerProperties(
    defaultServerProperties,
    settings?.properties ?? {}
  );

  const memory = settings?.memory ?? DEFAULT_JAVA_HEAP_SIZE;

  const setting = { properties, memory };

  // 保存
  await setDefaultSettings(setting);

  return setting;
}

// ワールド設定のデフォルト値を保存
export async function setDefaultSettings(
  worldSettings: SystemWorldSettings
): Promise<void> {
  serverStarterSetting.set(SETTINGS_KEY, worldSettings);
}