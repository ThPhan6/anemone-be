import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { SentryModule } from '@sentry/nestjs/setup';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database.module';
import { DeviceModule } from './device/device.module';
import { ScentModule } from './scent/scent.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';

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
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
