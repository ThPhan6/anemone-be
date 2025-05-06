import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { SettingDefinition } from '../setting-definition/entities/setting-definition.entity';
import { SettingValue } from '../setting-definition/entities/setting-value.entity';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SettingDefinition, SettingValue, ScentConfig])],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService],
})
export class SystemSettingsModule {}
