import { Column, Entity, OneToMany } from 'typeorm';

import { Product } from '../../modules/device/entities/product.entity';
import { BaseEntity } from './base.entity';
import { SystemSetting } from './system-setting.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'type', type: 'smallint' })
  type: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @OneToMany(() => SystemSetting, (setting) => setting.category)
  systemSettings: SystemSetting[];
}
