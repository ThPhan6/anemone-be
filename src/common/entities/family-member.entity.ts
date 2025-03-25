import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Family } from './family.entity';

export enum FamilyRole {
  MEMBER = 0,
  ADMIN = 1,
}

@Entity('family_members')
export class FamilyMember extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Family, (family) => family.members)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @Column({ name: 'role', type: 'smallint' })
  role: FamilyRole;
}
