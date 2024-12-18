import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CSMModule } from './cms/cms.module';
import { DatabaseModule } from './database.module';
import { MobileModule } from './mobile/mobile.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UserModule,
    CSMModule,
    MobileModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
