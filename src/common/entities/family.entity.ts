import { Column, Entity, OneToMany } from 'typeorm';

import { Device } from '../../modules/device/entities/device.entity';
import { BaseEntity } from './base.entity';
import { FamilyMember } from './family-member.entity';
import { Space } from './space.entity';

@Entity('families')
export class Family extends BaseEntity {
  @Column({ name: 'name', default: 'My Home' })
  name: string;

  @OneToMany(() => FamilyMember, (member) => member.family)
  members: FamilyMember[];

  @OneToMany(() => Space, (space) => space.family)
  spaces: Space[];

  @OneToMany(() => Device, (device) => device.family)
  devices: Device[];
}
