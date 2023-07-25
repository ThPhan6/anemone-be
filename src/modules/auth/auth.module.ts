import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordEntity } from 'common/entities/forgotPassword.entity';
import { UserEntity } from 'common/entities/user.entity';
import { ForgotPasswordRepository } from 'common/repositories/forgotPassword.repository';
import { UserRepository } from 'common/repositories/user.repository';
import { MailModule } from 'modules/mail/mail.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ThrottlerModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity, ForgotPasswordEntity]),
    MailModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, ForgotPasswordRepository],
})
export class AuthModule {}
