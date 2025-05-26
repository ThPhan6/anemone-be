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

export function convertURLToS3Readable(url: string, hasPrefix = true) {
  // check string is valid url or not
  if (!isValidURL(url)) {
    if (hasPrefix) {
      return `${process.env.AWS_PUBLIC_URL}/${process.env.AWS_BUCKET_KEY_PREFIX}/${url}`;
    }

    return `${process.env.AWS_PUBLIC_URL}/${url}`;
  }

  return url;
}

/**
 * Extracts the filepath and filename from an S3 URL or returns the original string if it's already a path
 * @param url The full S3 URL or file path
 * @returns Object containing filepath and filename, or the original string if not a URL
 *
 * @example
 * // Returns { filepath: 'staging/color', filename: 'mask-2.png' }
 * extractImageNameFromS3Url('https://anemone-assets-dev.s3.ap-southeast-1.amazonaws.com/staging/color/mask-2.png')
 *
 * // Returns { filepath: 'staging/color', filename: 'mask-2.png' } (if already just the path)
 * extractImageNameFromS3Url('staging/color/mask-2.png')
 *
 * // Returns { filepath: '', filename: 'image.jpg' } (if just filename)
 * extractImageNameFromS3Url('image.jpg')
 */
export function extractImageNameFromS3Url(
  url: string,
): { filepath: string; filename: string } | string {
  // If it's already just a filename (no slashes), return as is
  if (!url.includes('/')) {
    return url;
  }

  try {
    // If it's a URL, get the pathname
    const path = isValidURL(url) ? new URL(url).pathname : url;

    // Remove leading slash if exists
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Split into path and filename
    const lastSlashIndex = cleanPath.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      return { filepath: '', filename: cleanPath };
    }

    return {
      filepath: cleanPath.substring(0, lastSlashIndex),
      filename: cleanPath.substring(lastSlashIndex + 1),
    };
  } catch (error) {
    // If parsing fails, return the original string
    return url;
  }
}
