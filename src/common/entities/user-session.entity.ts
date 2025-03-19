import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Album } from './album.entity';
import { BaseEntity } from './base.entity';
import { Device } from './device.entity';
import { Playlist } from './playlist.entity';
import { Scent } from './scent.entity';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession extends BaseEntity {
  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ManyToOne(() => Album, { nullable: true })
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @ManyToOne(() => Playlist, { nullable: true })
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;

  @ManyToOne(() => Scent)
  @JoinColumn({ name: 'scent_id' })
  scent: Scent;

  @Column({ name: 'status', type: 'smallint' })
  status: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
