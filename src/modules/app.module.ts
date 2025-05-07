import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@sentry/nestjs/setup';

import { AlbumModule } from './album/album.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database.module';
import { DeviceModule } from './device/device.module';
import { MockModule } from './mock/mock.module';
import { PlaylistModule } from './playlist/playlist.module';
import { ProductModule } from './product/product.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ScentModule } from './scent/scent.module';
import { ScentConfigModule } from './scent-config/scent-config.module';
import { ScentMobileModule } from './scent-mobile/scent-mobile.module';
import { SettingDefinitionModule } from './setting-definition/setting-definition.module';
import { SpaceModule } from './space/space.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),
    StorageModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    DeviceModule,
    ScentModule,
    ScentConfigModule,
    SettingDefinitionModule,
    SpaceModule,
    PlaylistModule,
    ScentMobileModule,
    UserSettingsModule,
    MockModule,
    ProductModule,
    ProductVariantModule,
    AlbumModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
