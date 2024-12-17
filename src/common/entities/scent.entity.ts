import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('scents')
export class Scent extends BaseEntity {
  @Column()
  public name: string;
}
