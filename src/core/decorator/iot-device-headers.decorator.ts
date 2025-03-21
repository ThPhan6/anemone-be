import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiDeviceHeaders() {
  return applyDecorators(
    ApiHeader({ name: 'x-device-id', description: 'Device ID' }),
    // ApiHeader({ name: 'x-certificate-id', description: 'Certificate ID' }),
  );
}
