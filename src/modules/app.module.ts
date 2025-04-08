import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { SentryModule } from '@sentry/nestjs/setup';

import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { DatabaseModule } from './database.module';
import { DeviceModule } from './device/device.module';
import { PlaylistModule } from './playlist/playlist.module';
import { ScentMobileModule } from './scent.mobile/scent.mobile.module';
import { ScentModule } from './scent/scent.module';
import { SpaceModule } from './space/space.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SentryModule.forRoot(),
    StorageModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    DeviceModule,
    ScentModule,
    CategoryModule,
    SpaceModule,
    PlaylistModule,
    ScentMobileModule,
    UserSettingsModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
