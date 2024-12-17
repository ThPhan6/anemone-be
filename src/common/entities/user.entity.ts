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
  public cogId: string;

  @Column({ unique: true })
  public email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  public role: UserRole;

  @Column({
    name: 'is_active',
  })
  public isActive: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;
}
