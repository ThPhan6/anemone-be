import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';

import { Scent } from '../../common/entities/scent.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { CognitoService } from '../auth/cognito.service';
import { Device } from '../device/entities/device.entity';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { DeviceCommand } from '../device/entities/device-command.entity';
import { Product } from '../device/entities/product.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { SettingDefinition } from '../setting-definition/entities/setting-definition.entity';
import { ScentMobileController } from './scent-mobile.controller';
import { ScentMobileService } from './scent-mobile.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Scent,
      UserSetting,
      SettingDefinition,
      Product,
      ScentConfig,
      DeviceCommand,
      Device,
      DeviceCartridge,
      UserSession,
    ]),
  ],
  controllers: [ScentMobileController],
  providers: [ScentMobileService, CognitoService, AwsConfigService],
})
export class ScentMobileModule {}
