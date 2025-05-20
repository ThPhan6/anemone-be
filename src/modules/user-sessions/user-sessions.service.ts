import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSession } from '../../common/entities/user-session.entity';
import { PingDeviceStatus } from '../device/device.enum';
import { ConnectionStatus, Device } from '../device/entities/device.entity';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async getUserSession(userId: string) {
    const userSession = await this.userSessionRepository.findOne({
      where: {
        userId,
      },
      order: { createdAt: 'DESC' },
      relations: ['device', 'playlist', 'scent', 'album'],
    });

    const devices = await this.deviceRepository.find({
      where: {
        registeredBy: userId,
      },
    });

    return {
      devices:
        devices.length > 0
          ? devices.map((device) => ({
              id: device.id,
              status:
                device.connectionStatus === ConnectionStatus.CONNECTED
                  ? PingDeviceStatus.CONNECTED
                  : PingDeviceStatus.DISCONNECTED,
            }))
          : [],
      deviceStatus: userSession
        ? userSession?.device?.connectionStatus === ConnectionStatus.CONNECTED
          ? PingDeviceStatus.CONNECTED
          : PingDeviceStatus.DISCONNECTED
        : null,
      deviceId: userSession?.device?.id ?? null,
      scentStatus: userSession?.status ?? null,
      userSession: userSession ?? null,
    };
  }

  async deleteUserSession(userId: string) {
    const userSession = await this.userSessionRepository.findOne({
      where: {
        userId,
      },
    });

    if (userSession) {
      return await this.userSessionRepository.delete({ userId });
    }
  }
}
