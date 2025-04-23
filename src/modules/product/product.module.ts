import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductRepository } from '../../common/repositories/product.repository';
import { ScentConfigRepository } from '../../common/repositories/scent-config.repository';
import { Product } from '../device/entities/product.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ScentConfig])],
  controllers: [ProductController],
  providers: [ProductService, ScentConfigRepository, ProductRepository],
})
export class ProductModule {}
