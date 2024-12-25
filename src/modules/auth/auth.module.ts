import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AwsConfigService } from 'common/config/aws.config';

import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthCMSController } from './auth-cms.controller';
import { CognitoService } from './cognito.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthCMSController, AuthController],
  providers: [JwtStrategy, CognitoService, AwsConfigService],
  exports: [PassportModule, CognitoService],
})
export class AuthModule {}
