import * as path from 'path';

export function templateFilePath(location: string): string {
  return path.resolve(__dirname, '../../../templates', location);
}
