import fs from 'fs';
import path from 'path';
import { BytesData } from '../bytesData/bytesData.js';
import { Failable } from '../result.js';

function replaceSep(pathstr: string) {
  return pathstr.replace(/[\\\/]+/, path.sep).replace(/[\\\/]+$/, '');
}

export class Path {
  path: string;
  constructor(value?: string) {
    if (value === undefined) {
      this.path = '';
    } else {
      this.path = path.normalize(replaceSep(value));
    }
  }

  child(child: string) {
    if (this.path) {
      return new Path(this.path + '/' + child);
    }
    return new Path(child);
  }

  parent(times: number = 1) {
    if (this.path) {
      return new Path(this.path + '/..'.repeat(times));
    }
    return new Path(Array(times).fill('..').join('/'));
  }

  absolute() {
    return new Path(path.resolve(this.path));
  }

  str() {
    return this.path;
  }

  basename() {
    return path.basename(this.path);
  }

  extname() {
    return path.extname(this.path);
  }

  exists() {
    return fs.existsSync(this.path);
  }

  async isDirectory() {
    return await fs.promises.stat(this.absolute().str());
  }

  async rename(newpath: Path) {
    await fs.promises.rename(this.path, newpath.absolute().str());
  }

  async mkdir(recursive: boolean = false) {
    if (!this.exists()) await fs.promises.mkdir(this.path, { recursive });
  }

  async mklink(target: Path) {
    await new Promise((resolve) => fs.link(target.path, this.path, resolve));
  }

  async write(content: BytesData) {
    await content.write(this.path);
  }

  async read(): Promise<Failable<BytesData, Error>> {
    return await BytesData.fromPath(this.path);
  }

  async iter() {
    return (await fs.promises.readdir(this.path)).map((p) => this.child(p));
  }
}