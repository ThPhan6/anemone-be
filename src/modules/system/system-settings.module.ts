import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scent } from '../../common/entities/scent.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { SettingDefinitionRepository } from '../../common/repositories/setting-definition.repository';
import { ScentConfigModule } from '../scent-config/scent-config.module';
import { SettingDefinition } from './entities/setting-definition.entity';
import { SettingValue } from './entities/setting-value.entity';
import { SettingDefinitionService } from './setting-definition.service';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';
import { SystemSettingsAdminController } from './system-settings-admin.controller';
import { SystemSettingsAdminService } from './system-settings-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingDefinition, SettingValue, UserSetting, Scent]),
    ScentConfigModule,
  ],
  controllers: [SystemSettingsController, SystemSettingsAdminController],
  providers: [
    SystemSettingsService,
    SystemSettingsAdminService,
    SettingDefinitionService,
    SettingDefinitionRepository,
  ],
})
export class SystemSettingsModule {}
