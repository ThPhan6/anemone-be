import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSetting } from '../../common/entities/user-setting.entity';
import { SettingDefinition } from '../system/entities/setting-definition.entity';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSetting, SettingDefinition])],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
})
export class UserSettingsModule {}
