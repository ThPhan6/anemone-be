import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'common/repositories/user.repository';
import { AuthModule } from 'modules/auth/auth.module';
import { UserService } from 'modules/user/service/user.service';

import { Family } from '../../common/entities/family.entity';
import { FamilyMember } from '../../common/entities/family-member.entity';
import { Space } from '../../common/entities/space.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserCMSController } from './user-cms.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, UserSetting, UserSession, Family, FamilyMember, Space]),

    // Auth
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, UserCMSController],
  providers: [
    // User
    UserService,
    UserRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
