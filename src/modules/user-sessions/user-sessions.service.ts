import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserSession } from '../../common/entities/user-session.entity';
import { PingDeviceStatus } from '../device/device.enum';
import { Device } from '../device/entities/device.entity';

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
      relations: ['device', 'playlist', 'scent', 'album'],
    });

    const device = await this.deviceRepository.findOne({
      where: {
        registeredBy: userId,
        isConnected: true,
      },
    });

    if (!userSession && !device) {
      return {
        deviceStatus: null,
        scentStatus: null,
        userSession: null,
      };
    }

    const deviceStatus = (userSession?.device || device)?.isConnected
      ? PingDeviceStatus.CONNECTED
      : PingDeviceStatus.DISCONNECTED;

    return {
      deviceStatus,
      scentStatus: userSession?.status ?? null,
      userSession: userSession ?? null,
    };
  }
}
