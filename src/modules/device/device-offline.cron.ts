import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Device } from './entities/device.entity';

@Injectable()
export class DeviceOfflineCron {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleDeviceOfflineCheck() {
    const now = new Date();

    // Get connected devices
    const connectedDevices = await this.deviceRepository.find({
      where: { isConnected: true },
    });

    const devicesToUpdate = connectedDevices.filter((device) => {
      return device.lastPingAt && now.getTime() - device.lastPingAt.getTime() > 15 * 1000;
    });

    if (devicesToUpdate.length === 0) {
      return;
    }

    // Update these devices to disconnected
    for (const device of devicesToUpdate) {
      await this.deviceRepository.update(device.id, {
        isConnected: false,
      });
    }
  }
}
