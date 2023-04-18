import { API } from 'app/src-electron/api/api';
import { BackListener } from 'app/src-electron/core/ipc/link';
import { runCommand, runServer } from '../server/dummyServer';

export const backListener: BackListener<API> = {
  on: {
    Command: runCommand,
  },
  handle: {
    RunServer: runServer,
  },
};
