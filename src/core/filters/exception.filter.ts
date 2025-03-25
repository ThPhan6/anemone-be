import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { Message } from 'common/constants/app.constants';
import { MessageCode } from 'common/constants/messageCode';
import { ApiErrorDescription, ApiException } from 'common/types/apiException.type';
import { buildResponse } from 'core/helper';
import { HttpResponse } from 'core/types/response.type';

import { endWithPeriod } from '../../common/utils/string';
import { logger } from '../logger/index.logger';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  doNotReport(): Array<any> {
    return [NotFoundException, UnauthorizedException];
  }

  @SentryExceptionCaptured()
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    if (!error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(buildResponse(this.httpResponse(null)));
    }

    try {
      const res = this.httpResponse(error);
      if (error instanceof TypeError) {
        logger.error(
          `StatusCode : ${res.statusCode}, Message : ${error.message}, detail : ${error.stack}`,
        );
      } else {
        logger.error(`StatusCode : ${res.statusCode}, Message : ${res.message}`);
      }

      return response.status(res.statusCode).send(buildResponse(res));
    } catch (ex) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(buildResponse(this.httpResponse(null)));
    }
  }

  private httpResponse(error: any) {
    if (error instanceof ApiException) {
      return this.apiExceptionResponse(error);
    }

    const errRes = error.response;

    if (error instanceof BadRequestException) {
      const specificErrors: string[] = errRes?.errors ? Object.values(errRes.errors) : [];
      const errorMessage = specificErrors[0] || Message.invalidInput;

      return new HttpResponse({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        messageCode: MessageCode.invalidInput,
        message: endWithPeriod(errorMessage),
      });
    }

    return new HttpResponse({
      success: false,
      statusCode: error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      messageCode: error.messageCode || MessageCode.generalError,
      message: endWithPeriod(error.message || Message.generalError),
    });
  }

  private apiExceptionResponse(error: ApiException) {
    const res = new HttpResponse({
      success: false,
      statusCode: error.statusCode,
      messageCode: error.messageCode || MessageCode.generalError,
    });
    if (typeof error.message === 'string') {
      res.message = endWithPeriod(error.message);

      return res;
    }

    res.message =
      error.statusCode === HttpStatus.BAD_REQUEST ? Message.invalidInput : Message.generalError;
    if (error.message instanceof ApiErrorDescription) {
      res.error = error.message;
    }

    return res;
  }
}
