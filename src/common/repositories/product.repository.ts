import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Product } from '../../modules/device/entities/product.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(dataSource: DataSource) {
    super(Product, dataSource);
  }
}
