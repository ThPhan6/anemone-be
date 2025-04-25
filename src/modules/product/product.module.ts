import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { Product } from '../device/entities/product.entity';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ScentConfig, ProductVariant])],
  controllers: [ProductController],
  providers: [ProductService, ScentConfigRepository, ProductRepository, ProductVariantRepository],
})
export class ProductModule {}
