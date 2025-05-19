import { HttpStatus } from '@nestjs/common';
import { MessageCode } from 'common/constants/messageCode';

import { Message } from '../constants/app.constants';

export class ApiErrorDescription {
  [property: string]: string[];
}

export class ApiException {
  constructor(
    public statusCode: HttpStatus,
    public messageCode?: MessageCode,
    public message?: string | ApiErrorDescription,
  ) {}
}

export class ApiNotFoundException extends ApiException {
  constructor(messageCode: MessageCode, message: string) {
    super(HttpStatus.NOT_FOUND, messageCode ?? MessageCode.notFound, message ?? Message.notFound());
  }
}

export class ApiUnauthorizedException extends ApiException {
  constructor(messageCode?: MessageCode, message?: string) {
    super(HttpStatus.UNAUTHORIZED, messageCode, message);
  }
}

export class ApiForbiddenException extends ApiException {
  constructor(messageCode?: MessageCode, message?: string) {
    super(HttpStatus.FORBIDDEN, messageCode, message);
  }
}

export class ApiBadRequestException extends ApiException {
  constructor(messageCode?: MessageCode, message?: string | ApiErrorDescription) {
    super(HttpStatus.BAD_REQUEST, messageCode, message);
  }

  static checkErrorDescription(d: ApiErrorDescription, messageCode?: MessageCode) {
    if (Object.keys(d).length > 0) {
      throw new ApiBadRequestException(messageCode ?? MessageCode.invalidInput, d);
    }
  }
}

export class ApiInternalErrorException extends ApiException {
  constructor(messageCode?: MessageCode, message?: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, messageCode, message);
  }
}
