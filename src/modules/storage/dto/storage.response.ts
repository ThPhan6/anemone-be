import { ExposeApi } from 'core/decorator/property.decorator';

export class UploadImageResDto {
  @ExposeApi()
  fileKey: string;

  @ExposeApi()
  url: string;

  @ExposeApi()
  fileName: string;
}

export class ImageVariationsResDto {
  @ExposeApi()
  original: UploadImageResDto;

  @ExposeApi()
  large: UploadImageResDto;

  @ExposeApi()
  medium: UploadImageResDto;

  @ExposeApi()
  small: UploadImageResDto;

  @ExposeApi()
  thumbnail: UploadImageResDto;

  [key: string]: UploadImageResDto;
}
