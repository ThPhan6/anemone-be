import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'common/entities/user.entity';

import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User])],
  providers: [ConfigService, MailService],
  exports: [MailService],
})
export class MailModule {
  static forRoot(): DynamicModule {
    return {
      module: MailModule,
      global: true,
    };
  }
}
