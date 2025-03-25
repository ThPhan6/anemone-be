import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { Device } from '../../modules/device/entities/device.entity';
import { BaseEntity } from './base.entity';
import { Family } from './family.entity';

@Entity('spaces')
export class Space extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @ManyToOne(() => Family)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @Column({ name: 'created_by' })
  createdBy: string;

  @OneToMany(() => Device, (device) => device.space)
  devices: Device[];
}
