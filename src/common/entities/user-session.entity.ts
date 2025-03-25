import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Device } from '../../modules/device/entities/device.entity';
import { Album } from './album.entity';
import { BaseEntity } from './base.entity';
import { Playlist } from './playlist.entity';
import { Scent } from './scent.entity';

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

  @Column({ name: 'user_id' })
  userId: string;
}
