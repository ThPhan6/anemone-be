import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { logger } from 'core/logger/index.logger';
import * as dotenv from 'dotenv';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    if (!process.env.AWS_COGNITO_ISSUER) {
      logger.error('JwtStrategy Init failed - missing env.');
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
