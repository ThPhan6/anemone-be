import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { kebabCase } from 'lodash';

type ApiControllerOptions = { authRequired?: boolean } & (
  | { name: string; isMobile?: boolean }
  | { route: string; tags: string }
);

export function ApiController(options: ApiControllerOptions): ClassDecorator {
  const decorators: ClassDecorator[] = [];
  const name: string = options['name'];
  const isMobile: boolean = options['isMobile'];
  const version = options['version'] || 'v1';
  if (name) {
    decorators.push(ApiTags(name));
    const prefix = isMobile ? `${version}/app/` : '';
    decorators.push(Controller(`api/${prefix}${kebabCase(name).toLowerCase()}`));
  } else {
    decorators.push(ApiTags(options['tags']));
    decorators.push(Controller(options['route']));
  }

  return applyDecorators(...decorators);
}
