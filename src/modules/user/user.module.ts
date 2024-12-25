import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'common/entities/user.entity';
import { UserProfile } from 'common/entities/user-profile.entity';
import { UserRepository } from 'common/repositories/user.repository';
import { UserProfileRepository } from 'common/repositories/user-profile.repository';
import { UserProfileService } from 'core/services/user-profile.service';
import { AuthModule } from 'modules/auth/auth.module';
import { UserService } from 'modules/user/service/user.service';

import { UserController } from './user.controller';
import { UserCMSController } from './user-cms.controller';
import { UserManagementController } from './user-management.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, UserProfile]),

    // Auth
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, UserManagementController, UserCMSController],
  providers: [
    // User
    UserService,
    UserRepository,
    UserProfileService,
    UserProfileRepository,
  ],
  exports: [UserService, UserProfileService],
})
export class UserModule {}
