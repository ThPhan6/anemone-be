import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, PlaylistScent, Scent])],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}
