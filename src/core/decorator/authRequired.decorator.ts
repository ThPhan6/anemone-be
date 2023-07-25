import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticateUser } from 'core/guards/authenticate.guard';

export function AuthRequired(): ClassDecorator & PropertyDecorator {
  return applyDecorators(UseGuards(AuthenticateUser), ApiBearerAuth());
}
