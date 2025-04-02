import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../../common/entities/category.entity';
import { Space } from '../../common/entities/space.entity';
import { SystemSetting } from '../../common/entities/system-setting.entity';
import { StorageModule } from '../storage/storage.module';
import { DeviceController } from './controllers/device.controller';
import { DeviceIotController } from './controllers/device-iot.controller';
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
      Category,
      SystemSetting,
      Space,
    ]),
  ],
  controllers: [DeviceController, DeviceIotController],
  providers: [AwsIotCoreService, DeviceIotService, DeviceCertificateService, DeviceService],
  exports: [DeviceService, DeviceCertificateService],
})
export class DeviceModule {}
