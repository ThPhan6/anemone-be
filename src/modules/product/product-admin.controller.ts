import { FileTypeValidator, ParseFilePipe, Post, UploadedFile } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiUploadFile } from 'core/decorator/apiDoc.decorator';
import { AdminRoleGuard } from 'core/decorator/auth.decorator';

import { ProductService } from './product.service';

@AdminRoleGuard()
@ApiController({
  name: 'products',
  admin: true,
})
export class ProductAdminController extends BaseController {
  constructor(private readonly productService: ProductService) {
    super();
  }

  @Post('import')
  @ApiOperation({ summary: 'Import devices from CSV file' })
  @ApiUploadFile({
    path: 'import',
    bodyDescription: 'CSV file containing device data',
  })
  async importDevices(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.csv' })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productService.importDevicesFromCsv(file.buffer);
  }
}
