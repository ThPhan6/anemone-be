import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Device } from '../../common/entities/device.entity';
import { DeviceRepository } from '../../common/repositories/device.repository';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Device])],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceRepository],
})
export class DeviceModule {}
