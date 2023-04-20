import { Version } from 'app/src-electron/api/scheme';
import { Path } from '../utils/path/path';
import { BytesData } from '../utils/bytesData/bytesData';
import { Failable, isFailure } from '../../api/failable';
import { api } from '../api';

const ver_17_18 = [
  '1.18.1-rc2',
  '1.18.1-rc1',
  '1.18.1-pre1',
  '1.18',
  '1.18-rc4',
  '1.18-rc3',
  '1.18-rc2',
  '1.18-rc1',
  '1.18-pre8',
  '1.18-pre7',
  '1.18-pre6',
  '1.18-pre5',
  '1.18-pre4',
  '1.18-pre3',
  '1.18-pre2',
  '1.18-pre1',
  '21w44a',
  '21w43a',
  '21w42a',
  '21w41a',
  '21w40a',
  '21w39a',
  '21w38a',
  '21w37a',
  '1.17.1',
  '1.17.1-rc2',
  '1.17.1-rc1',
  '1.17.1-pre3',
  '1.17.1-pre2',
  '1.17.1-pre1',
  '1.17',
  '1.17-rc2',
  '1.17-rc1',
  '1.17-pre5',
  '1.17-pre4',
  '1.17-pre3',
  '1.17-pre2',
  '1.17-pre1',
  '21w20a',
  '21w19a',
  '21w18a',
  '21w17a',
  '21w16a',
  '21w15a',
  '21w14a',
  '21w13a',
  '21w11a',
  '21w10a',
  '21w08b',
  '21w08a',
  '21w07a',
  '21w06a',
  '21w05b',
  '21w05a',
  '21w03a',
];

const ver_12_16 = [
  '1.16.5',
  '1.16.5-rc1',
  '20w51a',
  '20w49a',
  '20w48a',
  '20w46a',
  '20w45a',
  '1.16.4',
  '1.16.4-rc1',
  '1.16.4-pre2',
  '1.16.4-pre1',
  '1.16.3',
  '1.16.3-rc1',
  '1.16.2',
  '1.16.2-rc2',
  '1.16.2-rc1',
  '1.16.2-pre3',
  '1.16.2-pre2',
  '1.16.2-pre1',
  '20w30a',
  '20w29a',
  '20w28a',
  '20w27a',
  '1.16.1',
  '1.16',
  '1.16-rc1',
  '1.16-pre8',
  '1.16-pre7',
  '1.16-pre6',
  '1.16-pre5',
  '1.16-pre4',
  '1.16-pre3',
  '1.16-pre2',
  '1.16-pre1',
  '20w22a',
  '20w21a',
  '20w20b',
  '20w20a',
  '20w19a',
  '20w18a',
  '20w17a',
  '20w16a',
  '20w15a',
  '20w14a',
  '20w14infinite',
  '20w13b',
  '20w13a',
  '20w12a',
  '20w11a',
  '20w10a',
  '20w09a',
  '20w08a',
  '20w07a',
  '20w06a',
  '1.15.2',
  '1.15.2-pre2',
  '1.15.2-pre1',
  '1.15.1',
  '1.15.1-pre1',
  '1.15',
  '1.15-pre7',
  '1.15-pre6',
  '1.15-pre5',
  '1.15-pre4',
  '1.15-pre3',
  '1.15-pre2',
  '1.15-pre1',
  '19w46b',
  '19w46a',
  '19w45b',
  '19w45a',
  '19w44a',
  '19w42a',
  '19w41a',
  '19w40a',
  '19w39a',
  '19w38b',
  '19w38a',
  '19w37a',
  '19w36a',
  '19w35a',
  '19w34a',
  '1.14.4',
  '1.14.4-pre7',
  '1.14.4-pre6',
  '1.14.4-pre5',
  '1.14.4-pre4',
  '1.14.4-pre3',
  '1.14.4-pre2',
  '1.14.4-pre1',
  '1.14.3',
  '1.14.3-pre4',
  '1.14.3-pre3',
  '1.14.3-pre2',
  '1.14.3-pre1',
  '1.14.2',
  '1.14.2 Pre-Release 4',
  '1.14.2 Pre-Release 3',
  '1.14.2 Pre-Release 2',
  '1.14.2 Pre-Release 1',
  '1.14.1',
  '1.14.1 Pre-Release 2',
  '1.14.1 Pre-Release 1',
  '1.14',
  '1.14 Pre-Release 5',
  '1.14 Pre-Release 4',
  '1.14 Pre-Release 3',
  '1.14 Pre-Release 2',
  '1.14 Pre-Release 1',
  '19w14b',
  '19w14a',
  '3D Shareware v1.34',
  '19w13b',
  '19w13a',
  '19w12b',
  '19w12a',
  '19w11b',
  '19w11a',
  '19w09a',
  '19w08b',
  '19w08a',
  '19w07a',
  '19w06a',
  '19w05a',
  '19w04b',
  '19w04a',
  '19w03c',
  '19w03b',
  '19w03a',
  '19w02a',
  '18w50a',
  '18w49a',
  '18w48b',
  '18w48a',
  '18w47b',
  '18w47a',
  '18w46a',
  '18w45a',
  '18w44a',
  '18w43c',
  '18w43b',
  '18w43a',
  '1.13.2',
  '1.13.2-pre2',
  '1.13.2-pre1',
  '1.13.1',
  '1.13.1-pre2',
  '1.13.1-pre1',
  '18w33a',
  '18w32a',
  '18w31a',
  '18w30b',
  '18w30a',
  '1.13',
  '1.13-pre10',
  '1.13-pre9',
  '1.13-pre8',
  '1.13-pre7',
  '1.13-pre6',
  '1.13-pre5',
  '1.13-pre4',
  '1.13-pre3',
  '1.13-pre2',
  '1.13-pre1',
  '18w22c',
  '18w22b',
  '18w22a',
  '18w21b',
  '18w21a',
  '18w20c',
  '18w20b',
  '18w20a',
  '18w19b',
  '18w19a',
  '18w16a',
  '18w15a',
  '18w14b',
  '18w14a',
  '18w11a',
  '18w10d',
  '18w10c',
  '18w10b',
  '18w10a',
  '18w09a',
  '18w08b',
  '18w08a',
  '18w07c',
  '18w07b',
  '18w07a',
  '18w06a',
  '18w05a',
  '18w03b',
  '18w03a',
  '18w02a',
  '18w01a',
  '17w50a',
  '17w49b',
  '17w49a',
  '17w48a',
  '17w47b',
  '17w47a',
  '17w46a',
  '17w45b',
  '17w45a',
  '17w43b',
  '17w43a',
  '1.12.2',
  '1.12.2-pre2',
  '1.12.2-pre1',
  '1.12.1',
  '1.12.1-pre1',
  '17w31a',
  '1.12',
  '1.12-pre7',
  '1.12-pre6',
  '1.12-pre5',
  '1.12-pre4',
  '1.12-pre3',
  '1.12-pre2',
  '1.12-pre1',
];

const ver_7_11 = [
  '17w18b',
  '17w18a',
  '17w17b',
  '17w17a',
  '17w16b',
  '17w16a',
  '17w15a',
  '17w14a',
  '17w13b',
  '17w13a',
  '17w06a',
  '1.11.2',
  '1.11.1',
  '16w50a',
  '1.11',
  '1.11-pre1',
  '16w44a',
  '16w43a',
  '16w42a',
  '16w41a',
  '16w40a',
  '16w39c',
  '16w39b',
  '16w39a',
  '16w38a',
  '16w36a',
  '16w35a',
  '16w33a',
  '16w32b',
  '16w32a',
  '1.10.2',
  '1.10.1',
  '1.10',
  '1.10-pre2',
  '1.10-pre1',
  '16w21b',
  '16w21a',
  '16w20a',
  '1.9.4',
  '1.9.3',
  '1.9.3-pre3',
  '1.9.3-pre2',
  '1.9.3-pre1',
  '16w15b',
  '16w15a',
  '16w14a',
  '1.RV-Pre1',
  '1.9.2',
  '1.9.1',
  '1.9.1-pre3',
  '1.9.1-pre2',
  '1.9.1-pre1',
  '1.9',
  '1.9-pre4',
  '1.9-pre3',
  '1.9-pre2',
  '1.9-pre1',
  '16w07b',
  '16w07a',
  '16w06a',
  '16w05b',
  '16w05a',
  '16w04a',
  '16w03a',
  '16w02a',
  '15w51b',
  '15w51a',
  '15w50a',
  '15w49b',
  '1.8.9',
  '15w49a',
  '15w47c',
  '15w47b',
  '15w47a',
  '15w46a',
  '15w45a',
  '15w44b',
  '15w44a',
  '15w43c',
  '15w43b',
  '15w43a',
  '15w42a',
  '15w41b',
  '15w41a',
  '15w40b',
  '15w40a',
  '15w39c',
  '15w39b',
  '15w39a',
  '15w38b',
  '15w38a',
  '15w37a',
  '15w36d',
  '15w36c',
  '15w36b',
  '15w36a',
  '15w35e',
  '15w35d',
  '15w35c',
  '15w35b',
  '15w35a',
  '15w34d',
  '15w34c',
  '15w34b',
  '15w34a',
  '15w33c',
  '15w33b',
  '15w33a',
  '15w32c',
  '15w32b',
  '15w32a',
  '15w31c',
  '15w31b',
  '15w31a',
  '1.8.8',
  '1.8.7',
  '1.8.6',
  '1.8.5',
  '1.8.4',
  '15w14a',
  '1.8.3',
  '1.8.2',
  '1.8.2-pre7',
  '1.8.2-pre6',
  '1.8.2-pre5',
  '1.8.2-pre4',
  '1.8.2-pre3',
  '1.8.2-pre2',
  '1.8.2-pre1',
  '1.8.1',
  '1.8.1-pre5',
  '1.8.1-pre4',
  '1.8.1-pre3',
  '1.8.1-pre2',
  '1.8.1-pre1',
  '1.8',
  '1.8-pre3',
  '1.8-pre2',
  '1.8-pre1',
  '14w34d',
  '14w34c',
  '14w34b',
  '14w34a',
  '14w33c',
  '14w33b',
  '14w33a',
  '14w32d',
  '14w32c',
  '14w32b',
  '14w32a',
  '14w31a',
  '14w30c',
  '14w30b',
  '14w30a',
  '14w29b',
  '14w29a',
  '14w28b',
  '14w28a',
  '14w27b',
  '14w27a',
  '14w26c',
  '14w26b',
  '14w26a',
  '14w25b',
  '14w25a',
  '14w21b',
  '14w21a',
  '14w20b',
  '14w20a',
  '1.7.10',
  '1.7.10-pre4',
  '1.7.10-pre3',
  '1.7.10-pre2',
  '1.7.10-pre1',
  '14w19a',
  '14w18b',
  '14w18a',
  '14w17a',
  '14w11b',
  '1.7.9',
  '1.7.8',
  '1.7.7',
  '1.7.6',
  '14w11a',
  '1.7.6-pre2',
  '1.7.6-pre1',
  '14w10c',
  '14w10b',
  '14w10a',
  '14w08a',
  '1.7.5',
  '14w07a',
  '14w06b',
  '14w06a',
  '14w05b',
  '14w05a',
  '14w04b',
  '14w04a',
  '14w03b',
  '14w03a',
  '14w02c',
  '14w02b',
  '14w02a',
  '1.7.4',
  '1.7.3',
  '13w49a',
  '13w48b',
  '13w48a',
  '13w47e',
  '13w47d',
  '13w47c',
  '13w47b',
  '13w47a',
  '1.7.2',
  '1.7.1',
  '1.7',
];

async function download_xml_12_16(serverPath: Path) {
  const xml = serverPath.child('log4j2_112-116.xml');
  if (!xml.exists()) {
    const data = await BytesData.fromURL(
      'https://launcher.mojang.com/v1/objects/02937d122c86ce73319ef9975b58896fc1b491d1/log4j2_112-116.xml'
    );
    if (isFailure(data)) return data;
    xml.write(data);
  }
}

async function download_xml_7_11(serverPath: Path) {
  const xml = serverPath.child('log4j2_17-111.xml');
  if (!xml.exists()) {
    const data = await BytesData.fromURL(
      'https://launcher.mojang.com/v1/objects/dd2b723346a8dcd48e7f4d245f6bf09e98db9696/log4j2_17-111.xml'
    );
    if (isFailure(data)) return data;
    xml.write(data);
  }
}

/** log4jに対応するファイルを生成し、Javaの実行時引数を返す */
export async function getLog4jArg(
  serverPath: Path,
  version: Version
): Promise<Failable<string | null>> {
  // log4jの脆弱性に対応
  // https://www.minecraft.net/ja-jp/article/important-message--security-vulnerability-java-edition-jp

  // 1.17-1.18
  if (version.id in ver_17_18) {
    return '-Dlog4j2.formatMsgNoLookups=true';
  }

  // 1.12-1.16.5
  if (version.id in ver_12_16) {
    api.send.UpdateStatus('log4jの設定ファイルをダウウンロード中');
    await download_xml_12_16(serverPath);
    return '-Dlog4j.configurationFile=log4j2_112-116.xml';
  }

  // 1.7-1.11.2
  if (version.id in ver_7_11) {
    api.send.UpdateStatus('log4jの設定ファイルをダウウンロード中');
    await download_xml_7_11(serverPath);
    return '-Dlog4j.configurationFile=log4j2_17-111.xml';
  }

  // それ以降orそれ以外
  return null;
}
