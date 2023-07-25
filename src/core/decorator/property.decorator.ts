import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, ExposeOptions } from 'class-transformer';

type Option = {
  apiOption?: ApiPropertyOptions;
  exposeOption?: ExposeOptions;
};

export function ExposeApi({ apiOption, exposeOption }: Option = {}) {
  return applyDecorators(ApiProperty(apiOption), Expose(exposeOption));
}

export function ExposeApiOptional({ apiOption, exposeOption }: Option = {}) {
  return applyDecorators(ApiPropertyOptional(apiOption), Expose(exposeOption));
}
