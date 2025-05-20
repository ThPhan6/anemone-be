import { BaseEntity } from 'common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum UserStatus {
  CONFIRMED = 'CONFIRMED', // User has completed confirmation and can sign in.
  UNCONFIRMED = 'UNCONFIRMED', // User has been created but not confirmed (email/phone not verified yet).
  ARCHIVED = 'ARCHIVED', // User has been deleted but retained for archival purposes.
  COMPROMISED = 'COMPROMISED', // User is flagged due to security risks (e.g., exposed credentials).
  UNKNOWN = 'UNKNOWN', // Catch-all for rare or undefined status.
  RESET_REQUIRED = 'RESET_REQUIRED', // User must reset password before sign-in.
  FORCE_CHANGE_PASSWORD = 'FORCE_CHANGE_PASSWORD', // User must change password on next sign-in (admin-created users).
  EXTERNAL_PROVIDER = 'EXTERNAL_PROVIDER', // User signed up via a federated IdP and is managed externally (e.g., Google, SAML, Facebook).
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
