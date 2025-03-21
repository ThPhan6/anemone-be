import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

import { CertificateAuthGuard } from '../guards/certificate-auth.guard';

export function CertificateAuth() {
  return applyDecorators(
    UseGuards(CertificateAuthGuard),
    ApiSecurity('X.509'), // For Swagger documentation
  );
}
