import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSetting } from '../../common/entities/user-setting.entity';
import { SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { SettingDefinitionService } from './setting-definition.service';
import { SettingDefinitionAdminController } from './setting-definition-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SettingDefinition, SettingValue, UserSetting])],
  controllers: [SettingDefinitionAdminController],
  providers: [SettingDefinitionService],
  exports: [SettingDefinitionService],
})
export class SettingDefinitionModule {}
