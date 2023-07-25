import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Message } from 'common/constants/app.constants';
import { MessageCode } from 'common/constants/messageCode';
import { ApiUnauthorizedException } from 'common/types/apiException.type';
import { IDataSign } from 'common/types/dataSign.type';
import { verifyData } from 'common/utils/jwt';

@Injectable()
export class AuthenticateUser implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as any;
    let token: string = (request.headers['x-access-token'] || request.headers.authorization || '') as string;
    const bearerPrefix = 'Bearer ';
    if (token.startsWith(bearerPrefix)) {
      token = token.slice(bearerPrefix.length, token.length);
    }

    if (token) {
      try {
        const payload = verifyData<IDataSign>(token);
        if (payload.userId && payload.sessionId) {
          request.user = payload;

          return true;
        }
      } catch (ex) {
        if (ex.name === 'TokenExpiredError') {
          throw new ApiUnauthorizedException(MessageCode.expiredToken, Message.expiredToken);
        }
      }
    }

    throw new ApiUnauthorizedException(MessageCode.badToken, Message.badToken);
  }
}
