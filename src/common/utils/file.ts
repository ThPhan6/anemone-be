import * as fs from 'fs';
import { readFile, utils } from 'xlsx';

import { isValidURL } from './string';

export function checkExistsFile(path: string): boolean {
  try {
    return fs.existsSync(path) ? true : false;
  } catch (error) {
    return false;
  }
}

export const readFileExcel = (filePath: string) => {
  const file = readFile(filePath);
  const sheets = file.SheetNames;
  const data: any = {};
  sheets.forEach((sheet, idx) => {
    const sheetData: any[] = utils.sheet_to_json(file.Sheets[file.SheetNames[idx]]);
    data[sheet] = sheetData;
  });

  return data;
};

export function convertURLToS3Readable(url: string, hasPrefix = false) {
  // check string is valid url or not
  if (!isValidURL(url)) {
    if (hasPrefix) {
      return `${process.env.AWS_PUBLIC_URL}/${process.env.AWS_BUCKET_KEY_PREFIX}/${url}`;
    }

    return `${process.env.AWS_PUBLIC_URL}/${url}`;
  }

  return url;
}
