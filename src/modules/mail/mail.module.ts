import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendgridEntity } from 'common/entities/sendgrid.entity';
import { UserEntity } from 'common/entities/user.entity';
import { SendgridRepository } from 'common/repositories/sendgrid.repository';

import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([SendgridEntity, UserEntity])],
  providers: [ConfigService, MailService, SendgridRepository],
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
