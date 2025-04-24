import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { ProductVariant } from '../../modules/product-variant/entities/product-variant.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariant> {
  constructor(dataSource: DataSource) {
    super(ProductVariant, dataSource);
  }
}
