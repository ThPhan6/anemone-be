import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Column({ name: 'name', nullable: true })
  public name: string;

  @Column({ name: 'preferred_username', nullable: true })
  public username: string;

  @Column({ name: 'picture', nullable: true })
  public picture: string;

  @Column({ name: 'phone_number', nullable: true })
  public phone: string;

  @Column({ name: 'email', nullable: true })
  public email: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  // Privacy settings
  @Column({ name: 'is_public', default: false })
  public isPublic: boolean;

  @Column({ name: 'allow_follower_access', default: false })
  public allowFollowerAccess: boolean;

  // Region settings
  @Column({ name: 'locale', nullable: true })
  locale: string;

  @Column({ name: 'zone_info', nullable: true })
  zoneInfo: string;
}
