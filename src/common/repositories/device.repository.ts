import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Device } from '../../modules/device/entities/device.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceRepository extends BaseRepository<Device> {
  constructor(dataSource: DataSource) {
    super(Device, dataSource);
  }
}
