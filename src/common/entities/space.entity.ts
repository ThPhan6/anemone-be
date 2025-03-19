import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Device } from './device.entity';
import { Family } from './family.entity';
import { User } from './user.entity';

@Entity('spaces')
export class Space extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @ManyToOne(() => Family)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => Device, (device) => device.space)
  devices: Device[];
}
