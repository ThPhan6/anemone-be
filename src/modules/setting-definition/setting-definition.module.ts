import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scent } from '../../common/entities/scent.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { SettingDefinitionRepository } from '../../common/repositories/setting-definition.repository';
import { SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { ScentTagAdminController } from './scent-tag-admin.controller';
import { SettingDefinitionService } from './setting-definition.service';
import { SettingDefinitionAdminController } from './setting-definition-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SettingDefinition, SettingValue, UserSetting, Scent])],
  controllers: [SettingDefinitionAdminController, ScentTagAdminController],
  providers: [SettingDefinitionService, SettingDefinitionRepository],
  exports: [SettingDefinitionService],
})
export class SettingDefinitionModule {}
