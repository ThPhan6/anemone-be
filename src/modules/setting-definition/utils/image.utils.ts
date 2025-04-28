import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

/**
 * Base64 image regex pattern
 */
export const BASE64_IMAGE_REGEX = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;

/**
 * Checks if a string is a base64 encoded image
 */
export const isBase64Image = (str: string): boolean => {
  return !!str && typeof str === 'string' && BASE64_IMAGE_REGEX.test(str);
};

/**
 * Converts a base64 image string to a Buffer
 */
export const base64ToBuffer = (
  base64String: string,
): { buffer: Buffer; mimeType: string; extension: string } | null => {
  try {
    if (!isBase64Image(base64String)) {
      return null;
    }

    // Extract the MIME type
    const mimeMatch = base64String.match(BASE64_IMAGE_REGEX);
    if (!mimeMatch) {
      return null;
    }

    const mimeType = `image/${mimeMatch[1]}`;
    const extension = mimeMatch[1] === 'jpeg' ? 'jpg' : mimeMatch[1];

    // Remove the data URL prefix and convert to buffer
    const base64Data = base64String.replace(BASE64_IMAGE_REGEX, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return {
      buffer,
      mimeType,
      extension,
    };
  } catch (error) {
    const logger = new Logger('base64ToBuffer');
    logger.error(`Error converting base64 to buffer: ${error.message}`);

    return null;
  }
};

/**
 * Generates a file object from a base64 string
 */
export const base64ToFile = (
  base64String: string,
  fileName?: string,
): Express.Multer.File | null => {
  const converted = base64ToBuffer(base64String);

  if (!converted) {
    return null;
  }

  const { buffer, mimeType, extension } = converted;
  const generatedFileName = fileName || `${uuid()}.${extension}`;

  // Create a file object compatible with Express.Multer.File
  const file: Express.Multer.File = {
    fieldname: 'file',
    originalname: generatedFileName,
    encoding: '7bit',
    mimetype: mimeType,
    buffer,
    size: buffer.length,
    stream: null,
    destination: '',
    filename: generatedFileName,
    path: '',
  };

  return file;
};
