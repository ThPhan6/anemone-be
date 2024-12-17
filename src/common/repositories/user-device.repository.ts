import { Injectable } from '@nestjs/common';
import { UserDevice } from 'common/entities/user-device.entity';
import { DataSource } from 'typeorm';

import { BaseRepository } from './base.repository';

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDevice> {
  constructor(dataSource: DataSource) {
    super(UserDevice, dataSource);
  }
}
