import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Playlist } from '../entities/playlist.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class PlaylistRepository extends BaseRepository<Playlist> {
  constructor(dataSource: DataSource) {
    super(Playlist, dataSource);
  }
}
