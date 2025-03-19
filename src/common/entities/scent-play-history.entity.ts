import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Scent } from './scent.entity';
import { User } from './user.entity';

@Entity('scent_play_histories')
export class ScentPlayHistory extends BaseEntity {
  @ManyToOne(() => Scent, (scent) => scent.playHistories)
  @JoinColumn({ name: 'scent_id' })
  scent: Scent;

  @Column({ name: 'played_at', type: 'timestamp', nullable: true })
  playedAt: Date;

  @Column({ name: 'duration', type: 'numeric', nullable: true })
  duration: number;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
