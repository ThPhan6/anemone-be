import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';

import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { CognitoService } from '../auth/cognito.service';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
@Module({
  imports: [TypeOrmModule.forFeature([Playlist, PlaylistScent, Scent])],
  controllers: [PlaylistController],
  providers: [PlaylistService, CognitoService, AwsConfigService],
})
export class PlaylistModule {}
