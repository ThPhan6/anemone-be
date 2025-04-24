import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductRepository } from '../../common/repositories/product.repository';
import { ProductVariantRepository } from '../../common/repositories/product-variant.repository';
import { Product } from '../device/entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantController } from './product-variant.controller';
import { ProductVariantService } from './product-variant.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, Product])],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, ProductVariantRepository, ProductRepository],
})
export class ProductVariantModule {}
