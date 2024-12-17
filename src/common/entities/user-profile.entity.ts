import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Column()
  public name: string;

  @Column({
    nullable: true,
  })
  public username: string;

  @Column({
    nullable: true,
  })
  public avatar: string;

  @Column({
    nullable: true,
  })
  public country: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;
}
