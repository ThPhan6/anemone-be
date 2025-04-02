import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Space } from '../../common/entities/space.entity';
import { Device } from '../device/entities/device.entity';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

@Module({
  imports: [TypeOrmModule.forFeature([Space, Device])],
  controllers: [SpaceController],
  providers: [SpaceService],
})
export class SpaceModule {}
