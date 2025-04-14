import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsConfigService } from 'common/config/aws.config';

import { Category } from '../../common/entities/category.entity';
import { Scent } from '../../common/entities/scent.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { CognitoService } from '../auth/cognito.service';
import { ScentMobileController } from './scent-mobile.controller';
import { ScentMobileService } from './scent-mobile.service';
@Module({
  imports: [TypeOrmModule.forFeature([Scent, Category, UserSetting])],
  controllers: [ScentMobileController],
  providers: [ScentMobileService, CognitoService, AwsConfigService],
})
export class ScentMobileModule {}
