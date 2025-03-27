import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AwsConfigService } from 'common/config/aws.config';

import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { CognitoService } from './cognito.service';
import { CmsJwtStrategy, MobileJwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [MobileJwtStrategy, CmsJwtStrategy, CognitoService, AwsConfigService],
  exports: [PassportModule, CognitoService],
})
export class AuthModule {}
