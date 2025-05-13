import { FileTypeValidator, ParseFilePipe, Post, UploadedFile } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'core/controllers/base.controller';
import { ApiController } from 'core/decorator/apiController.decorator';
import { ApiUploadFile } from 'core/decorator/apiDoc.decorator';
import { AdminRoleGuard } from 'core/decorator/auth.decorator';

import { DeviceService } from '../services/device.service';

@AdminRoleGuard()
@ApiController({
  name: 'devices',
  admin: true,
})
export class DeviceAdminController extends BaseController {
  constructor(private readonly deviceService: DeviceService) {
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
    return this.deviceService.importDevicesFromCsv(file.buffer);
  }
}
