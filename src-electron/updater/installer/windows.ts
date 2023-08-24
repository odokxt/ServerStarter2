import { spawn } from 'child_process';
import { BytesData } from 'app/src-electron/util/bytesData';
import { isError } from 'app/src-electron/util/error/error';
import { app } from 'electron';
import { mainPath } from 'app/src-electron/core/const';

/** windowsの最新版をダウンロードしてインストールして再起動 */
export const installWindows = async (msiurl: string): Promise<void> => {
  const dest = mainPath.child('updater.msi');
  const data = await BytesData.fromURL(msiurl);

  if (isError(data)) return;
  await data.write(dest.str(), true);

  const bat = mainPath.child('updater.bat');
  await bat.writeText(`@echo off
echo updating
msiexec /i updater.msi /qb
start "" "${app.getPath('exe')}"
exit`);

  const sub = spawn('start', ['/min', '""', 'updater.bat'], {
    cwd: mainPath.str(),
    env: process.env,
    shell: true,
    detached: true,
    windowsHide: true,
  });
  sub.unref();

  app.exit();
};
