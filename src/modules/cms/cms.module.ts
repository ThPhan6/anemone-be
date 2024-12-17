import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';
import { Setting } from 'common/entities/setting.entity';
import { User } from 'common/entities/user.entity';
import { UserProfile } from 'common/entities/user-profile.entity';
import { SettingRepository } from 'common/repositories/setting.repository';
import { UserRepository } from 'common/repositories/user.repository';
import { UserProfileRepository } from 'common/repositories/user-profile.repository';
import { AuthService } from 'core/services/auth.service';
import { SettingService } from 'core/services/setting.service';
import { UserProfileService } from 'core/services/user-profile.service';
import { UserService } from 'modules/user/user.service';

import { AuthController } from './v1/auth/auth.controller';
import { MasterDataController } from './v1/masterdata/masterdata.controller';
import { UserController } from './v1/user/user.controller';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Setting, User, UserProfile])],
  controllers: [MasterDataController, UserController, AuthController],
  providers: [
    SettingService,
    SettingRepository,
    UserRepository,
    AwsConfigService,
    AuthService,
    UserService,
    UserProfileService,
    UserProfileRepository,
  ],
})
export class CSMModule {}
