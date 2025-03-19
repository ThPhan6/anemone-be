import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { PlaylistScent } from './playlist-scent.entity';
import { ScentPlayHistory } from './scent-play-history.entity';
import { User } from './user.entity';

@Entity('scents')
export class Scent extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'intensity', type: 'numeric' })
  intensity: number;

  @Column({ name: 'cartridge_info', type: 'json' })
  cartridgeInfo: any;

  @Column({ name: 'tags', type: 'json' })
  tags: any;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => PlaylistScent, (ps) => ps.scent)
  playlistScents: PlaylistScent[];

  @OneToMany(() => ScentPlayHistory, (history) => history.scent)
  playHistories: ScentPlayHistory[];
}
