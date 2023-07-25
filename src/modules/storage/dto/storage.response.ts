import { ExposeApi } from 'core/decorator/property.decorator';

export class UploadImageResDto {
  @ExposeApi()
  fileKey: string;

  @ExposeApi()
  url: string;
}
