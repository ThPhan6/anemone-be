import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scent } from '../../common/entities/scent.entity';
import { Space } from '../../common/entities/space.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { SettingDefinition } from '../setting-definition/entities/setting-definition.entity';
import { SettingValue } from '../setting-definition/entities/setting-value.entity';
import { StorageModule } from '../storage/storage.module';
import { DeviceController } from './controllers/device.controller';
import { DeviceAdminController } from './controllers/device-admin.controller';
import { DeviceIotController } from './controllers/device-iot.controller';
import { DeviceOfflineCron } from './device-offline.cron';
import { Device } from './entities/device.entity';
import { DeviceCartridge } from './entities/device-cartridge.entity';
import { DeviceCertificate } from './entities/device-certificate.entity';
import { DeviceCommand } from './entities/device-command.entity';
import { Product } from './entities/product.entity';
import { AwsIotCoreService } from './services/aws-iot-core.service';
import { DeviceService } from './services/device.service';
import { DeviceCertificateService } from './services/device-certificate.service';
import { DeviceIotService } from './services/device-iot.service';
@Module({
  imports: [
    ConfigModule,
    StorageModule,
    TypeOrmModule.forFeature([
      Device,
      DeviceCertificate,
      DeviceCartridge,
      DeviceCommand,
      Product,
      SettingDefinition,
      SettingValue,
      Space,
      UserSession,
      Scent,
      ProductVariant,
    ]),
  ],
  controllers: [DeviceController, DeviceIotController, DeviceAdminController],
  providers: [
    AwsIotCoreService,
    DeviceIotService,
    DeviceCertificateService,
    DeviceService,
    DeviceOfflineCron,
    ProductVariantRepository,
  ],
  exports: [DeviceService, DeviceCertificateService],
})
export class DeviceModule {}
