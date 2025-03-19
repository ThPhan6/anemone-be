import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Family } from './family.entity';
import { User } from './user.entity';

export enum FamilyRole {
  MEMBER = 0,
  ADMIN = 1,
}

@Entity('family_members')
export class FamilyMember extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Family, (family) => family.members)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @Column({ name: 'role', type: 'smallint' })
  role: FamilyRole;
}
