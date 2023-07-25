import * as fs from 'fs';

export function checkExistsFile(path: string): boolean {
  try {
    return fs.existsSync(path) ? true : false;
  } catch (error) {
    return false;
  }
}
