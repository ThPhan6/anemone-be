import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image', nullable: true })
  image: string;

  @Column({ name: 'color', nullable: true })
  color: string;
}
