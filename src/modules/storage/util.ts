import * as fs from 'fs';
import * as path from 'path';

export class LocalStorage {
  constructor(private localDir: string) {}

  saveLocalFile(data: Buffer | string, filename: string) {
    const dir = path.resolve(__dirname, '../../..', this.localDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(path.resolve(dir, filename), data);
  }

  readLocalFile(filename: string): Buffer {
    return fs.readFileSync(path.resolve(__dirname, '../../..', this.localDir, filename));
  }
}
