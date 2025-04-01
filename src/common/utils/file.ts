import * as fs from 'fs';
import { readFile, utils } from 'xlsx';

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
