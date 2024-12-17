import { Injectable } from '@nestjs/common';
import { UserDevice } from 'common/entities/user-device.entity';
import { UserDeviceRepository } from 'common/repositories/user-device.repository';

import { BaseService } from './base.service';

@Injectable()
export class UserDeviceService extends BaseService<UserDevice> {
  constructor(repo: UserDeviceRepository) {
    super(repo);
  }
}
