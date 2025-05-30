import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Album } from '../entities/album.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class AlbumRepository extends BaseRepository<Album> {
  constructor(dataSource: DataSource) {
    super(Album, dataSource);
  }
}
