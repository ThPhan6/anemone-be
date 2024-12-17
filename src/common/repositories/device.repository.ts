import { Injectable } from '@nestjs/common';
import { Device } from 'common/entities/device.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceRepository extends BaseRepository<Device> {
  constructor(dataSource: DataSource) {
    super(Device, dataSource);
  }
}
