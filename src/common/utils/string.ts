import * as iconv from 'iconv-lite';
import * as StrUtil from 'str-util';
import * as wanakana from 'wanakana';

export function sjis(val: string): string {
  return iconv.encode(val, 'SHIFT_JIS').toString();
}

export function sjisSize(val: string): number {
  return sjis(val).length;
}

export function isHan(val: string): boolean {
  return sjisSize(val) === val.length;
}

export function halfWidthRomaji(str: string): string {
  return StrUtil.toHalfWidth(wanakana.toRomaji(str));
}

export function endWithPeriod(str: string): string {
  if (!str.endsWith('.')) {
    return str + '.';
  }

  return str;
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);

    return true;
  } catch (e) {
    return false;
  }
}
