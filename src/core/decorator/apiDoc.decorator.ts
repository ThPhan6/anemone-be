import { applyDecorators, Post, Type, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiProperty,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { HttpResponse, PaginationMetaData } from 'core/types/response.type';

export enum ApiDataWrapType {
  pagination,
  array,
}

function getTypeInfo<T extends Type>(type: T | string) {
  if (typeof type === 'string') {
    return {
      type: type,
    };
  }

  return {
    $ref: getSchemaPath(type),
  };
}

function okResponseDataDescription<T extends Type>(type: T | string, wrapType?: ApiDataWrapType) {
  if (wrapType === ApiDataWrapType.pagination) {
    return {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: getTypeInfo(type),
        },
        pagination: { $ref: getSchemaPath(PaginationMetaData) },
      },
    };
  }

  if (wrapType === ApiDataWrapType.array) {
    return {
      type: 'array',
      items: getTypeInfo(type),
    };
  }

  return getTypeInfo(type);
}

export function ApiBaseOkResponse<T extends Type>(options: {
  type?: T | string;
  description?: string;
  wrapType?: ApiDataWrapType;
  messageCodeRemark?: string;
}): MethodDecorator {
  const apiOkOptions: ApiResponseOptions = {
    schema: {
      allOf: [
        { $ref: getSchemaPath(HttpResponse) },
        {
          properties: {
            statusCode: {
              type: 'number',
            },
            messageCode: {
              type: 'string',
              description: options.messageCodeRemark,
            },
            data: !options.type ? undefined : okResponseDataDescription(options.type, options.wrapType),
            success: {
              type: 'boolean',
            },
          },
        },
      ],
    },
  };
  if (!options.type || typeof options.type === 'string') {
    return applyDecorators(
      ApiExtraModels(HttpResponse),
      ApiExtraModels(PaginationMetaData),
      ApiOkResponse(apiOkOptions),
      ApiOperation({ summary: options.description }),
    );
  }

  return applyDecorators(
    ApiExtraModels(HttpResponse),
    ApiExtraModels(PaginationMetaData),
    ApiExtraModels(options.type),
    ApiOkResponse(apiOkOptions),
    ApiOperation({ summary: options.description }),
  );
}

export function ApiBaseRequestBody<T extends Type>(options: { type: T; isArray?: boolean }): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(options.type),
    ApiBody({
      schema:
        options.isArray === true
          ? {
              type: 'array',
              items: getTypeInfo(options.type),
            }
          : {
              $ref: getSchemaPath(options.type),
            },
    }),
  );
}

export function ApiDoc<T extends Type, V extends Type>(options: {
  requestBody: { type: T; isArray?: boolean };
  response: { type?: V | string; description?: string; wrapType?: ApiDataWrapType };
}): MethodDecorator {
  return applyDecorators(ApiBaseRequestBody(options.requestBody), ApiBaseOkResponse(options.response));
}

export function ApiFileResponse(options: { description: string; type: string }): MethodDecorator {
  return applyDecorators(
    ApiOperation({ description: options.description }),
    ApiProduces(options.type),
    ApiOkResponse({ type: 'file' }),
  );
}

export function ApiUploadFile<T extends Type>(options: {
  type?: T;
  path?: string;
  bodyDescription?: string;
}): MethodDecorator {
  const arr = [
    ApiConsumes('multipart/form-data'),
    Post(options.path),
    UseInterceptors(FileInterceptor('file')),
    ApiExtraModels(FileSchema),
  ];
  if (options.type) {
    arr.push(
      ApiBody({
        schema: {
          allOf: [{ $ref: getSchemaPath(options.type) }, { $ref: getSchemaPath(FileSchema) }],
        },
      }),
      ApiExtraModels(options.type),
    );
  } else {
    arr.push(ApiBody({ type: FileSchema }));
  }

  return applyDecorators(...arr);
}

class FileSchema {
  @ApiProperty({ type: 'file' })
  file: Express.Multer.File;
}
