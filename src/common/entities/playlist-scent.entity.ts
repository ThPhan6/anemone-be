import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Playlist } from './playlist.entity';
import { Scent } from './scent.entity';

@Entity('playlist_scents')
export class PlaylistScent extends BaseEntity {
  @ManyToOne(() => Playlist, (playlist) => playlist.playlistScents)
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;

  @ManyToOne(() => Scent, (scent) => scent.playlistScents)
  @JoinColumn({ name: 'scent_id' })
  scent: Scent;

  @Column({ name: 'sequence', type: 'numeric' })
  sequence: number;
}
