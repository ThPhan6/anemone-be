import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DeviceCartridge } from '../../modules/device/entities/device-cartridge.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class DeviceCartridgeRepository extends BaseRepository<DeviceCartridge> {
  constructor(dataSource: DataSource) {
    super(DeviceCartridge, dataSource);
  }
}
