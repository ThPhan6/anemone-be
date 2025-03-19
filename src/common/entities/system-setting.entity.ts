import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Category } from './category.entity';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
