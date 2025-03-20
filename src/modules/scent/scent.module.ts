import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Album } from '../../common/entities/album.entity';
import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { ScentPlayHistory } from '../../common/entities/scent-play-history.entity';
import { ScentRepository } from '../../common/repositories/scent.repository';
import { ScentController } from './scent.controller';
import { ScentService } from './scent.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      Scent,
      Album,
      Playlist,
      AlbumPlaylist,
      PlaylistScent,
      ScentPlayHistory,
    ]),
  ],
  controllers: [ScentController],
  providers: [ScentService, ScentRepository],
})
export class ScentModule {}
