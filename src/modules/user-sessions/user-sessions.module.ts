import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSession } from '../../common/entities/user-session.entity';
import { Device } from '../device/entities/device.entity';
import { UserSessionsController } from './user-sessions.controller';
import { UserSessionsService } from './user-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession, Device])],
  controllers: [UserSessionsController],
  providers: [UserSessionsService],
  exports: [UserSessionsService],
})
export class UserSessionsModule {}
