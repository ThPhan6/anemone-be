import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AlbumPlaylist } from '../entities/album-playlist.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AlbumPlaylistRepository extends BaseRepository<AlbumPlaylist> {
  constructor(dataSource: DataSource) {
    super(AlbumPlaylist, dataSource);
  }
}
