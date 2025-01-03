import { Injectable } from '@nestjs/common';
import { Device } from 'common/entities/device.entity';
import { DeviceRepository } from 'common/repositories/device.repository';
import * as csv from 'csvtojson';
import { unlinkSync } from 'fs';

import { DeviceType } from '../../common/enums/device.enum';
import { BaseService } from '../../core/services/base.service';
import { ImportDeviceDto } from './dto/device.request';

@Injectable()
export class DeviceService extends BaseService<Device> {
  constructor(repo: DeviceRepository) {
    super(repo);
  }

  async importDevicesFromCsv(file: Express.Multer.File): Promise<void> {
    const devices = await this.readCsvFile(file);
    if (devices.length) {
      await this.saveAll(devices);
    }

    // Remove the uploaded file
    unlinkSync(file.path);
  }

  private readCsvFile(file: Express.Multer.File): Promise<ImportDeviceDto[]> {
    const devices: ImportDeviceDto[] = [];

    return new Promise((resolve) => {
      csv()
        .fromFile(file.path)
        .then((jsonObj) => {
          jsonObj.forEach((row) => {
            devices.push({
              name: row.Name,
              type: DeviceType.IOT,
            });
          });

          resolve(devices);
        });
    });
  }
}
