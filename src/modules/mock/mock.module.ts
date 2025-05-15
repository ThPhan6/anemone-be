import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Device } from '../device/entities/device.entity';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { Product } from '../device/entities/product.entity';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { MockController } from './mock.controller';
import { MockService } from './mock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Device, DeviceCartridge, ScentConfig, ProductVariant]),
  ],
  controllers: [MockController],
  providers: [MockService],
})
export class MockModule {}
