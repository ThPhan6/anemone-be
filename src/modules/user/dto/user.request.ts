import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ExposeApi, ExposeApiOptional } from 'core/decorator/property.decorator';

import { CheckAny } from '../../../core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from '../../../core/types/apiQuery.type';
import { UserRole, UserType } from '../entities/user.entity';

export class UserGetListQueries extends ApiBaseGetListQueries {
  @ExposeApi()
  @IsEnum(UserType)
  @IsNotEmpty({ message: 'User type is required' })
  @ApiProperty({
    description: 'Type of user: 1 for CMS, 2 for APP',
    enum: UserType,
    enumName: 'UserType',
    example: UserType.CMS,
  })
  type: UserType;
}

export class CreateUserDto {
  @ExposeApi()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ExposeApi()
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  name: string;

  @ExposeApi()
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  givenName: string;

  @ExposeApi()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsOptional()
  role: UserRole = UserRole.MEMBER;

  @CheckAny({ required: true })
  @IsBoolean({ message: 'Enabled must be a boolean' })
  @IsNotEmpty({ message: 'Enabled is required' })
  enabled: boolean;

  @ExposeApi()
  @IsBoolean({ message: 'isAdmin must be a boolean' })
  @IsOptional()
  isAdmin: boolean = false;
}

export class UpdateUserDto {
  @ExposeApiOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  email?: string;

  @ExposeApiOptional()
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  name?: string;

  @ExposeApiOptional()
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  givenName?: string;

  @ExposeApiOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsOptional()
  role?: UserRole = UserRole.MEMBER;

  @ExposeApiOptional()
  @IsBoolean({ message: 'Enabled must be a boolean' })
  @IsOptional()
  enabled?: boolean;

  @ExposeApiOptional()
  @IsBoolean({ message: 'isAdmin must be a boolean' })
  @IsOptional()
  isAdmin?: boolean;
}
