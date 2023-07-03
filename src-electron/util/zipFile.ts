import { CentralDirectory, Open, File } from 'unzipper';
import { Path } from './path';
import { errorMessage } from './error/construct';
import { BytesData } from './bytesData';
import { Failable } from './error/failable';

export class ZipFile {
  private zip: Promise<CentralDirectory>;
  private files: Promise<File[]>;
  path: Path;

  constructor(path: Path) {
    this.path = path;
    const zip = Open.file(path.path);
    this.zip = zip;
    this.files = (async () => (await zip).files)();
  }

  async getFile(path: string): Promise<Failable<BytesData>> {
    const file = (await this.files).find((d) => d.path === path);
    if (file === undefined)
      return errorMessage.data.path.notFound({
        type: 'file',
        path: this.path.path + '(' + path + ')',
      });
    return BytesData.fromBuffer(await file.buffer());
  }

  async hasFile(path: string): Promise<boolean> {
    const file = (await this.files).find((d) => d.path === path);
    return file !== undefined;
  }

  /** 正規表現にあったパスを持つファイルの一覧を返す */
  async match(pattern: RegExp): Promise<File[]> {
    return (await this.files).filter((d) => d.path.match(pattern));
  }

  /** zipを展開 */
  async extract(path: Path) {
    await (
      await this.zip
    ).extract({
      path: path.path,
      concurrency: 10,
    });
  }
}