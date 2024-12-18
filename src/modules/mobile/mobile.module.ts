import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';
import { User } from 'common/entities/user.entity';
import { UserProfile } from 'common/entities/user-profile.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { UserProfileRepository } from 'common/repositories/user-profile.repository';
import { AuthService } from 'core/services/auth.service';
import { UserProfileService } from 'core/services/user-profile.service';
import { UserService } from 'modules/user/user.service';

import { AuthController } from './v1/auth/auth.controller';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User, UserProfile])],
  controllers: [AuthController],
  providers: [
    AwsConfigService,
    AuthService,
    UserService,
    UserProfileService,
    UserRepository,
    UserProfileRepository,
  ],
})
export class MobileModule {}
