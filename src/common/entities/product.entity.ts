import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Category } from './category.entity';

export enum ProductType {
  DEVICE = 0,
  CARTRIDGE = 1,
}

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'manufacturer_id' })
  manufacturerId: string;

  @Column({ name: 'sku' })
  sku: string;

  @Column({ name: 'batch_id' })
  batchId: string;

  @Column({ name: 'serial_number', unique: true })
  serialNumber: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'type', type: 'smallint' })
  type: ProductType;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
