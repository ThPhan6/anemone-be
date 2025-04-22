import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { kebabCase, startCase } from 'lodash';

type ApiControllerOptions = { authRequired?: boolean } & (
  | { name: string; admin?: boolean }
  | { route: string; tags: string }
);

export function ApiController(options: ApiControllerOptions): ClassDecorator {
  const decorators: ClassDecorator[] = [];
  const name: string = options['name'];
  const admin: string = options['admin'];
  const version = options['version'] || 'v1';

  const prefix = admin ? `api/${version}/admin` : `api/${version}`;

  if (name) {
    decorators.push(ApiTags(options['tags'] || startCase(name)));
    decorators.push(Controller(`${prefix}/${kebabCase(name).toLowerCase()}`));
  } else {
    decorators.push(ApiTags(options['tags']));
    decorators.push(Controller(`${prefix}/${options['route']}`));
  }

  return applyDecorators(...decorators);
}
