import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'modules/auth/auth.module';

import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, AuthModule, UserModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
