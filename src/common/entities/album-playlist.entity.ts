import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Album } from './album.entity';
import { BaseEntity } from './base.entity';
import { Playlist } from './playlist.entity';
import { User } from './user.entity';

@Entity('album_playlists')
export class AlbumPlaylist extends BaseEntity {
  @ManyToOne(() => Album, (album) => album.albumPlaylists)
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @ManyToOne(() => Playlist, (playlist) => playlist.albumPlaylists)
  @JoinColumn({ name: 'playlist_id' })
  playlist: Playlist;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
