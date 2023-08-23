import { isError } from '../util/error/error';
import { osPlatform } from '../util/os';
import { getLatestRelease } from './fetch';
import { installWindows } from './installer/windows';
import { getSystemVersion } from './version';

/**
 * アップデートがあるかどうかチェック
 * 本体バージョンはpackage.jsonのversionを参照
 * リモートのバージョンはgithubのリリース情報のtag_nameを参照
 */
async function checkUpdate() {
  const currentVersion = await getSystemVersion();
  const latestRelease = await getLatestRelease();
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
  const update = await checkUpdate();
  if (update === false) return;
  if (isError(update)) return;

  if (osPlatform === 'windows-x64') {
    await installWindows(update.windows);
  }
}
