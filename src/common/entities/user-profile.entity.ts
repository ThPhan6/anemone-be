import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Column({ name: 'name', nullable: true })
  public firstName: string;

  @Column({ name: 'given_name', nullable: true })
  public lastName: string;

  @Column({ name: 'preferred_username', nullable: true })
  public username: string;

  @Column({ name: 'picture', nullable: true })
  public picture: string;

  @Column({ name: 'phone_number', nullable: true })
  public phone: string;

  @Column({ name: 'email', nullable: true })
  public email: string;

  @Column({ name: 'user_id' })
  userId: string;

  // Privacy settings
  @Column({ name: 'is_public', default: false })
  public isPublic: boolean;

  @Column({ name: 'follower_access', default: false })
  public followerAccess: boolean;

  // Region settings
  @Column({ name: 'locale', nullable: true })
  locale: string;

  @Column({ name: 'zone_info', nullable: true })
  zoneInfo: string;
}
