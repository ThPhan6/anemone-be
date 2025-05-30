import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AwsConfigService } from '../../common/config/aws.config';
import { Album } from '../../common/entities/album.entity';
import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { UserFavorites } from '../../common/entities/user-favorites.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { AlbumRepository } from '../../common/repositories/album.repository';
import { AlbumPlaylistRepository } from '../../common/repositories/album-playlist.repository';
import { PlaylistRepository } from '../../common/repositories/playlist-repository';
import { UserRepository } from '../../common/repositories/user.repository';
import { UserSessionRepository } from '../../common/repositories/user-session.repository';
import { CognitoService } from '../auth/cognito.service';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { AlbumAdminController } from './album-admin.controller';
import { AlbumAdminService } from './album-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Album, AlbumPlaylist, Playlist, UserFavorites, UserSetting])],
  controllers: [AlbumController, AlbumAdminController],
  providers: [
    AlbumService,
    AlbumAdminService,
    CognitoService,
    AwsConfigService,
    AlbumRepository,
    AlbumPlaylistRepository,
    PlaylistRepository,
    UserSessionRepository,
    UserRepository,
  ],
})
export class AlbumModule {}
