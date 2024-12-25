import { Injectable } from '@nestjs/common';
import { Device } from 'common/entities/device.entity';
import { DeviceRepository } from 'common/repositories/device.repository';

import { BaseService } from '../../core/services/base.service';

@Injectable()
export class DeviceService extends BaseService<Device> {
  constructor(repo: DeviceRepository) {
    super(repo);
  }
}
