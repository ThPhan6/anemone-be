import { UserRole } from 'common/enums/user.enum';
import { Column, Entity, OneToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { UserProfile } from './user-profile.entity';

// Entities
@Entity('users')
export class User extends BaseEntity {
  @Column({
    name: 'cog_id',
    length: 64,
    unique: true,
  })
  cogId: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'password', select: false })
  password: string;

  @Column({ name: 'third_party_accounts', type: 'json', nullable: true })
  thirdPartyAccounts: any;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;
}
