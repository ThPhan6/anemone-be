import { BaseEntity } from 'common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum UserStatus {
  CONFIRMED = 'CONFIRMED',
  UNCONFIRMED = 'UNCONFIRMED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  STAFF = 'STAFF',
}

export enum UserType {
  CMS = 1,
  APP = 2,
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'uuid', readonly: true })
  user_id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', name: 'given_name' })
  givenName: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.UNCONFIRMED,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CMS,
  })
  type: UserType;

  @Column({ type: 'boolean', name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'boolean', name: 'phone_number_verified', default: false })
  phoneNumberVerified: boolean;

  @Column({ type: 'boolean', name: 'is_admin', default: false })
  isAdmin: boolean;
}
