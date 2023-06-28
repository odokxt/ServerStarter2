import { datapackFiles } from './datapack';
import { pluginFiles } from './plugin';
import { modFiles } from './mod';
import { Path } from 'app/src-electron/util/path';
import {
  WorldAdditional,
  WorldEditedAdditional,
} from 'app/src-electron/schema/world';
import { WithError, withError } from 'app/src-electron/util/error/witherror';
import { errorMessage } from 'app/src-electron/util/error/construct';
import { ServerAdditionalFiles } from './base';
import { FileData } from 'app/src-electron/schema/filedata';
import { ErrorMessage } from 'app/src-electron/schema/error';
import { isError } from 'app/src-electron/util/error/error';

export const serverAllAdditionalFiles = {
  async load(cwdPath: Path): Promise<WithError<WorldAdditional>> {
    const [_datapacks, _plugins, _mods] = await Promise.all([
      datapackFiles.load(cwdPath),
      pluginFiles.load(cwdPath),
      modFiles.load(cwdPath),
    ]);
    const errors = _datapacks.errors.concat(_plugins.errors, _mods.errors);

    const datapacks = _datapacks.value;

    const plugins = _plugins.value;

    const mods = _mods.value;

    return withError({ datapacks, plugins, mods }, errors);
  },

  async save(
    cwdPath: Path,
    value: WorldEditedAdditional
  ): Promise<WithError<void>> {
    const errors: ErrorMessage[] = [];

    async function saveEach<T extends FileData>(
      files: ServerAdditionalFiles<T>,
      values: (T & { path?: string })[] | ErrorMessage
    ): Promise<void> {
      if (isError(values)) return;
      const result = await files.save(cwdPath, values);
      errors.push(...result.errors);
      if (isError(result.value)) errors.push(result.value);
    }
    await Promise.all([
      saveEach(datapackFiles, value.datapacks),
      saveEach(pluginFiles, value.plugins),
      saveEach(modFiles, value.mods),
    ]);

    return withError(undefined, errors);
  },
};
