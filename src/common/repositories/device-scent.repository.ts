import { Injectable } from '@nestjs/common';
import { DeviceScent } from 'common/entities/device-scent.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceScentRepository extends BaseRepository<DeviceScent> {
  constructor(dataSource: DataSource) {
    super(DeviceScent, dataSource);
  }
}
