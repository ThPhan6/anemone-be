import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';

import { Album } from '../../common/entities/album.entity';
import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { ScentPlayHistory } from '../../common/entities/scent-play-history.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { CognitoService } from '../auth/cognito.service';
import { Device } from '../device/entities/device.entity';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { DeviceCommand } from '../device/entities/device-command.entity';
import { Product } from '../device/entities/product.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { SettingDefinition } from '../system/entities/setting-definition.entity';
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
      UserSetting,
      SettingDefinition,
      Product,
      ScentConfig,
      DeviceCommand,
      Device,
      DeviceCartridge,
      UserSession,
    ]),
  ],
  controllers: [ScentController],
  providers: [ScentService, CognitoService, AwsConfigService],
})
export class ScentModule {}
