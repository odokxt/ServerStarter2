import { rootLoggerHierarchy } from '../core/logger';
import { getSystemSettings, setSystemSettings } from '../core/stores/system';
import { isError } from '../util/error/error';
import { osPlatform } from '../util/os';
import { getLatestRelease } from './fetch';
import { installMac } from './installer/mac';
import { installWindows } from './installer/windows';
import { getSystemVersion } from './version';

/**
 * アップデートがあるかどうかチェック
 * 本体バージョンはpackage.jsonのversionを参照
 * リモートのバージョンはgithubのリリース情報のtag_nameを参照
 */
async function checkUpdate() {
  const currentVersion = await getSystemVersion();
  const latestRelease = await getLatestRelease(osPlatform);
  // アップデートの取得に失敗
  if (isError(latestRelease)) return latestRelease;
  // アップデートなし
  if (currentVersion === latestRelease.version) return false;
  return latestRelease;
}

/**
 * アップデートがあるかどうかチェックしてアップデート
 * 本体バージョンはpackage.jsonのversionを参照
 * リモートのバージョンはgithubのリリース情報のtag_nameを参照
 */
export async function update() {
  const logger = rootLoggerHierarchy.update({});
  logger.start(getSystemVersion());
  const update = await checkUpdate();
  logger.info(update);


  if (update === false) {
    return;
  }

  if (isError(update)) {
    return;
  }

  // lastUpdatedTimeをundefinedに
  const sys = await getSystemSettings();
  sys.system.lastUpdatedTime = undefined;
  await setSystemSettings(sys);

  if (osPlatform === 'windows-x64') await installWindows(update.url);
  if (osPlatform === 'mac-os' || osPlatform === 'mac-os-arm64')
    await installMac(update.url);
  logger.success();
}
