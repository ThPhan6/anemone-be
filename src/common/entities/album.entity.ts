import { Column, Entity, OneToMany } from 'typeorm';

import { AlbumPlaylist } from './album-playlist.entity';
import { BaseEntity } from './base.entity';

@Entity('albums')
export class Album extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @OneToMany(() => AlbumPlaylist, (ap) => ap.album)
  albumPlaylists: AlbumPlaylist[];
}
