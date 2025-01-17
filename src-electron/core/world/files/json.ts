import { PlayerUUID, Timestamp, UUID } from 'app/src-electron/schema/brands';
import { MemorySettings } from 'app/src-electron/schema/memory';
import { Remote } from 'app/src-electron/schema/remote';
import { Version } from 'app/src-electron/schema/version';
import {
  FAIL,
  booleanFixer,
  defaultFixer,
  literalFixer,
  numberFixer,
  objectFixer,
  optionalFixer,
  stringFixer,
} from 'app/src-electron/util/detaFixer/fixer';
import { fixMemorySettings } from '../../fixers/memory';
import { fixVersion } from '../../fixers/version';
import { fixRemote } from '../../fixers/remote';
import { fixPlayerUUID, fixUUID } from '../../fixers/brands';
import { ServerSettingFile } from './base';
import { getSystemSettings } from '../../stores/system';
import { isError } from 'app/src-electron/util/error/error';
import { errorMessage } from 'app/src-electron/util/error/construct';
import { ngrok_settingFixer } from '../../fixers/ngrok';
import { NgrokSetting } from 'app/src-electron/schema/ngrok';

/**
 * ワールドのディレクトリ構成
 * vanilla : world { DIM-1 | DIM1}
 * plugin  : world | world_nether | world_end
 */
export type WorldDirectoryTypes = 'vanilla' | 'plugin';

/**
 * ワールドの設定
 * server_settings.jsonの内容
 */
export type WorldSettings = {
  /** 使用メモリ量 */
  memory: MemorySettings;

  /** Javaの実行時引数 */
  javaArguments?: string;

  /** バージョン */
  version: Version;

  /** 同期先のリモートリポジトリ */
  remote?: Remote;

  /** 最終プレイ日
   *
   * 協定世界時 (UTC) 1970 年 1 月 1 日 00:00:00 からのミリ秒単位の経過時間を表す数値
   * new Dateの引数にすることで日付が得られる
   */
  last_date?: Timestamp;

  /** 最終プレイ者 */
  last_user?: PlayerUUID;

  /** 最終プレイ環境 */
  last_id?: UUID;

  /** 起動中フラグ */
  using?: boolean;

  /** ディレクトリ構成 "vanilla" | "plugin" */
  directoryType?: WorldDirectoryTypes;

  /** Ngrokによるポート開放不要化機能を利用するか */
  ngrok_setting: NgrokSetting;
};

export async function worldSettingsFixer() {
  const defaultMemory = (await getSystemSettings()).world.memory;
  const fixWorldSettings = objectFixer<WorldSettings>(
    {
      /** 使用メモリ量 */
      memory: defaultFixer(fixMemorySettings, defaultMemory),

      /** Javaの実行時引数 */
      javaArguments: optionalFixer(stringFixer()),

      /** バージョン */
      version: fixVersion,

      /** 同期先のリモートリポジトリ */
      remote: optionalFixer(fixRemote),

      /** 最終プレイ日
       *
       * 協定世界時 (UTC) 1970 年 1 月 1 日 00:00:00 からのミリ秒単位の経過時間を表す数値
       * new Dateの引数にすることで日付が得られる
       */
      last_date: optionalFixer(numberFixer()),

      /** 最終プレイ者 */
      last_user: optionalFixer(fixPlayerUUID),

      /** 最終プレイ環境 */
      last_id: optionalFixer(fixUUID),

      /** 起動中フラグ */
      using: optionalFixer(booleanFixer()),

      /** ディレクトリ構成 "vanilla" | "plugin" */
      directoryType: optionalFixer(literalFixer(['vanilla', 'plugin'])),

      /** Ngrokによるポート開放不要化機能を利用するか */
      ngrok_setting: ngrok_settingFixer
    },
    false
  );
  return fixWorldSettings;
}

export const WORLD_SETTINGS_PATH = 'server_settings.json';

export const serverJsonFile: ServerSettingFile<WorldSettings> = {
  async load(cwdPath) {
    const jsonPath = cwdPath.child(WORLD_SETTINGS_PATH);

    const data = await jsonPath.readJson<WorldSettings>();

    if (isError(data)) return data;

    const fixed = (await worldSettingsFixer())(data);

    if (fixed === FAIL)
      return errorMessage.data.path.invalidContent.invalidWorldSettingJson({
        type: 'file',
        path: jsonPath.path,
      });

    return fixed;
  },
  async save(cwdPath, value) {
    const jsonPath = cwdPath.child(WORLD_SETTINGS_PATH);
    await jsonPath.writeJson(value);
  },
  path(cwdPath) {
    return cwdPath.child(WORLD_SETTINGS_PATH);
  },
};
