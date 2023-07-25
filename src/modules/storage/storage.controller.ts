import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, UploadedFile } from '@nestjs/common';
import { MaxFileSize, MediaType } from 'common/constants/app.constants';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiBaseOkResponse, ApiUploadFile } from 'core/decorator/apiDoc.decorator';

import { UploadImageResDto } from './dto/storage.response';
import { StorageService } from './storage.service';

@ApiController({
  name: 'Storage',
  authRequired: true,
})
export class StorageController extends BaseController {
  constructor(private readonly service: StorageService) {
    super();
  }

  @ApiBaseOkResponse({
    description: 'upload image',
  })
  @ApiUploadFile({
    path: 'upload-temp-image',
    bodyDescription: 'image file',
  })
  async uploadImageFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: MediaType.image }),
          new MaxFileSizeValidator({ maxSize: MaxFileSize.image }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.dataType(UploadImageResDto, await this.service.uploadImageFile(file));
  }
}
