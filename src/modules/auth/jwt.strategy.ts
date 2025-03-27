import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { logger } from 'core/logger/index.logger';
import * as dotenv from 'dotenv';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

dotenv.config();

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(Strategy, 'mobile') {
  constructor() {
    if (!process.env.AWS_COGNITO_MOBILE_ISSUER) {
      logger.error('MobileJwtStrategy Init failed - missing env.');
    }

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AWS_COGNITO_MOBILE_ISSUER}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: process.env.AWS_COGNITO_MOBILE_ISSUER,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any): any {
    return payload;
  }
}

@Injectable()
export class CmsJwtStrategy extends PassportStrategy(Strategy, 'cms') {
  constructor() {
    if (!process.env.AWS_COGNITO_ISSUER) {
      logger.error('CmsJwtStrategy Init failed - missing env.');
    }

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AWS_COGNITO_ISSUER}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: process.env.AWS_COGNITO_ISSUER,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any): any {
    return payload;
  }
}
