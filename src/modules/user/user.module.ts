import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'common/entities/user.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { MailModule } from 'modules/mail/mail.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MailModule.forRoot()],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
