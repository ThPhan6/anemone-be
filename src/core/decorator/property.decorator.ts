import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, ExposeOptions, Transform } from 'class-transformer';

type Option = {
  apiOption?: ApiPropertyOptions;
  exposeOption?: ExposeOptions;
};

function transformBoolean() {
  return Transform(({ value }) => {
    if (['true', true].includes(value)) {
      return true;
    }

    if (['false', false].includes(value)) {
      return false;
    }

    return value;
  });
}

export function ExposeApi({ apiOption, exposeOption }: Option = {}) {
  return applyDecorators(ApiProperty(apiOption), Expose(exposeOption), transformBoolean());
}

export function ExposeApiOptional({ apiOption, exposeOption }: Option = {}) {
  return applyDecorators(ApiPropertyOptional(apiOption), Expose(exposeOption), transformBoolean());
}
