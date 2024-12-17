import { Injectable } from '@nestjs/common';
import { DeviceLink } from 'common/entities/device-linking.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceLinkRepository extends BaseRepository<DeviceLink> {
  constructor(dataSource: DataSource) {
    super(DeviceLink, dataSource);
  }
}
