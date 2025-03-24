import { applyDecorators, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export const IoTDevice = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request.device;
});

export function ApiDeviceHeaders() {
  return applyDecorators(ApiHeader({ name: 'x-device-id', description: 'Device ID' }));
}
