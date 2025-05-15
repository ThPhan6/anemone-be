import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';

import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { CognitoService } from '../auth/cognito.service';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { Product } from '../device/entities/product.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { SettingDefinition } from '../system/entities/setting-definition.entity';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Playlist,
      PlaylistScent,
      Scent,
      ScentConfig,
      SettingDefinition,
      Product,
      UserSession,
      DeviceCartridge,
      AlbumPlaylist,
    ]),
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService, CognitoService, AwsConfigService],
})
export class PlaylistModule {}
