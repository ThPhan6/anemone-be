import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryModule } from '@sentry/nestjs/setup';

import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database.module';
import { DeviceModule } from './device/device.module';
import { MasterDataModule } from './masterdata/masterdata.module';
import { ScentModule } from './scent/scent.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SentryModule.forRoot(),
    DatabaseModule,
    UserModule,
    MasterDataModule,
    AuthModule,
    DeviceModule,
    ScentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
