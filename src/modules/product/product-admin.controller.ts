import {
  FileTypeValidator,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiUploadFile } from 'core/decorator/apiDoc.decorator';
import { StaffRoleGuard } from 'core/decorator/auth.decorator';
import { DownloadService } from 'core/services/download.service';
import { Response } from 'express';

import { ProductService } from './product.service';

@StaffRoleGuard()
@ApiController({
  name: 'products',
  admin: true,
})
export class ProductAdminController extends BaseController {
  constructor(
    private readonly productService: ProductService,
    private readonly downloadService: DownloadService,
  ) {
    super();
  }

  @Post('imports')
  @ApiOperation({ summary: 'Import devices from CSV file' })
  @ApiUploadFile({
    path: 'imports',
    bodyDescription: 'CSV file containing device data',
  })
  async importDevices(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.csv' })],
        fileIsRequired: true,
        exceptionFactory: () =>
          new HttpException(
            'Invalid file type. Only CSV files are allowed.',
            HttpStatus.BAD_REQUEST,
          ),
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.productService.importDevicesFromCsv(file.buffer);
  }

  @Get('download/:fileName')
  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({
    name: 'fileName',
    description: 'Name of the file to download',
    type: String,
  })
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response): Promise<void> {
    await this.downloadService.downloadZipFile(fileName, res);
  }
}
