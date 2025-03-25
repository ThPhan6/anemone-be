import { UserRole } from 'modules/user/user.type';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

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

  @Column({ name: 'third_party_accounts', type: 'json', nullable: true })
  thirdPartyAccounts: any;

  @Column({ name: 'user_id' })
  userId: string;
}
