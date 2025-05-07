import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AwsConfigService } from '../../common/config/aws.config';
import { Album } from '../../common/entities/album.entity';
import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { CognitoService } from '../auth/cognito.service';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';

@Module({
  imports: [TypeOrmModule.forFeature([Album, AlbumPlaylist, Playlist])],
  controllers: [AlbumController],
  providers: [AlbumService, CognitoService, AwsConfigService],
})
export class AlbumModule {}
