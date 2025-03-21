import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiResponseOptions {
  type?: Type<any>;
  isPaginated?: boolean;
}

export function ApiSuccessResponse(options: ApiResponseOptions = {}) {
  const { type, isPaginated = false } = options;

  return applyDecorators(
    ApiExtraModels(type),
    ApiOkResponse({
      schema: {
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: type
            ? isPaginated
              ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(type) },
                }
              : { $ref: getSchemaPath(type) }
            : {},
          pagination: isPaginated
            ? {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 50 },
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                },
              }
            : {},
        },
      },
    }),
  );
}

export function ApiErrorResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      schema: {
        properties: {
          status: { type: 'string', example: 'error' },
          error_code: { type: 'string', example: 'INVALID_REQUEST' },
          message: { type: 'string', example: 'Invalid request data' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Email is required' },
              },
            },
          },
        },
      },
    }),
  );
}
