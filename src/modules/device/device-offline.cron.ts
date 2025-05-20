import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';

import { ConnectionStatus, Device } from './entities/device.entity';

@Injectable()
export class DeviceOfflineCron {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleDeviceOfflineCheck() {
    // Get connected devices
    const connectedDevices = await this.deviceRepository.find({
      where: { connectionStatus: ConnectionStatus.CONNECTED },
    });

    const devicesToUpdate = connectedDevices.filter((device) => {
      return (
        device.lastPingAt &&
        !device.name.includes('Mock device') &&
        moment().diff(moment(device.lastPingAt), 'seconds') >
          parseInt(process.env.HEARTBEAT_EXPIRE_SECONDS)
      );
    });

    if (devicesToUpdate.length === 0) {
      return;
    }

    // Update these devices to disconnected
    for (const device of devicesToUpdate) {
      await this.deviceRepository.update(device.id, {
        connectionStatus: ConnectionStatus.DISCONNECTED_BY_DEVICE,
      });
    }
  }
}
