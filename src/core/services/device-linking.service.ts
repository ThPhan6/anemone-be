import { Injectable } from '@nestjs/common';
import { DeviceLink } from 'common/entities/device-linking.entity';
import { DeviceLinkRepository } from 'common/repositories/device-linking.repository';

import { BaseService } from './base.service';

@Injectable()
export class DeviceLinkService extends BaseService<DeviceLink> {
  constructor(repo: DeviceLinkRepository) {
    super(repo);
  }
}
