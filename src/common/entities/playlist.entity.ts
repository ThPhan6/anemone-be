import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AlbumPlaylist } from './album-playlist.entity';
import { BaseEntity } from './base.entity';
import { PlaylistScent } from './playlist-scent.entity';
import { User } from './user.entity';

@Entity('playlists')
export class Playlist extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image' })
  image: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => AlbumPlaylist, (ap) => ap.playlist)
  albumPlaylists: AlbumPlaylist[];

  @OneToMany(() => PlaylistScent, (ps) => ps.playlist)
  playlistScents: PlaylistScent[];
}
