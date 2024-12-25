import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from 'common/entities/setting.entity';
import { SettingRepository } from 'common/repositories/setting.repository';

import { MasterDataController } from './masterdata.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Setting])],
  controllers: [MasterDataController],
  providers: [SettingService, SettingRepository],
})
export class MasterDataModule {}
