import { Column, Entity } from 'typeorm';

import { BaseEntityNumberId } from './base.entity';

@Entity('scents')
export class Scent extends BaseEntityNumberId {
  @Column()
  public name: string;
}
