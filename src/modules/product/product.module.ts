import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceCartridgeRepository } from '../../common/repositories/device-cartridge.repository';
import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { IotService } from '../../core/services/iot-core.service';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { Product } from '../device/entities/product.entity';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductAdminController } from './product-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ScentConfig, ProductVariant, DeviceCartridge])],
  controllers: [ProductController, ProductAdminController],
  providers: [
    ProductService,
    ScentConfigRepository,
    ProductRepository,
    ProductVariantRepository,
    DeviceCartridgeRepository,
    IotService,
  ],
})
export class ProductModule {}
