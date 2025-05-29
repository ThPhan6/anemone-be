import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryModule } from '@sentry/nestjs/setup';

import { AlbumModule } from './album/album.module';
import { AuthModule } from './auth/auth.module';
import { CountryModule } from './country/country.module';
import { DatabaseModule } from './database.module';
import { DeviceModule } from './device/device.module';
import { MockModule } from './mock/mock.module';
import { PlaylistModule } from './playlist/playlist.module';
import { ProductModule } from './product/product.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { ScentModule } from './scent/scent.module';
import { SpaceModule } from './space/space.module';
import { StorageModule } from './storage/storage.module';
import { SystemSettingsModule } from './system/system-settings.module';
import { UnifiedSearchModule } from './unified-search/unified-search.module';
import { UserModule } from './user/user.module';
import { UserFavoritesModule } from './user-favorites/user-favorites.module';
import { UserSessionsModule } from './user-sessions/user-sessions.module';
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
    SpaceModule,
    PlaylistModule,
    UserSettingsModule,
    MockModule,
    ProductModule,
    ProductVariantModule,
    SystemSettingsModule,
    AlbumModule,
    UserFavoritesModule,
    UserSessionsModule,
    UnifiedSearchModule,
    CountryModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
