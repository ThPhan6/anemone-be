import { Column, Entity, OneToMany } from 'typeorm';

import { AlbumPlaylist } from './album-playlist.entity';
import { BaseEntity } from './base.entity';
import { PlaylistScent } from './playlist-scent.entity';

@Entity('playlists')
export class Playlist extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @OneToMany(() => AlbumPlaylist, (ap) => ap.playlist)
  albumPlaylists: AlbumPlaylist[];

  @OneToMany(() => PlaylistScent, (ps) => ps.playlist)
  playlistScents: PlaylistScent[];
}
