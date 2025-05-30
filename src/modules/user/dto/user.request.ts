import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ExposeApi, ExposeApiOptional } from 'core/decorator/property.decorator';

import { CheckAny } from '../../../core/decorator/validators/checkAny.decorator';
import { ApiBaseGetListQueries } from '../../../core/types/apiQuery.type';
import { GenderType, UserRole, UserType } from '../entities/user.entity';

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
}

export class UpdateUserDto {
  @ExposeApiOptional()
  @ValidateIf((o) => o.type === UserType.CMS)
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  @ApiProperty({
    description: 'First name (CMS users only)',
    required: false,
    type: String,
  })
  name?: string;

  @ExposeApiOptional()
  @ValidateIf((o) => o.type === UserType.CMS)
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  @ApiProperty({
    description: 'Last name (CMS users only)',
    required: false,
    type: String,
  })
  givenName?: string;

  @ExposeApiOptional()
  @ValidateIf((o) => o.type === UserType.CMS)
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  @IsOptional()
  @ApiProperty({
    description: 'User role (CMS users only)',
    enum: UserRole,
    enumName: 'UserRole',
    required: false,
  })
  role?: UserRole = UserRole.MEMBER;

  @ExposeApiOptional()
  @ValidateIf((o) => o.type === UserType.APP)
  @IsBoolean({ message: 'Enabled must be a boolean' })
  @IsNotEmpty({ message: 'Enabled status is required for mobile users' })
  @ApiProperty({
    description: 'User enabled status (required for mobile users only)',
    required: false,
    type: Boolean,
  })
  enabled?: boolean;

  @CheckAny({ required: true })
  @IsEnum(UserType, { message: 'Type must be a valid user type' })
  @ApiProperty({
    description: 'Type of user: CMS or APP',
    enum: UserType,
    enumName: 'UserType',
    example: UserType.CMS,
  })
  type: UserType;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'First name' })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName?: string;

  @ApiProperty({ example: 'Last name' })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Last name must be less than 50 characters' })
  lastName?: string;

  @ApiProperty({ example: 2000 })
  @IsNumber({}, { message: 'Year of birth must be a number' })
  @IsOptional()
  yearOfBirth?: number;

  @ApiProperty({ example: 'Male' })
  @IsEnum(GenderType, { message: 'Gender must be a valid gender' })
  @IsOptional()
  gender?: GenderType;

  @ApiProperty({ example: 199 })
  @IsNumber({}, { message: 'Country must be a number' })
  @IsOptional()
  countryId?: number;

  @ApiProperty({ example: 'Avatar.png' })
  @IsString({ message: 'Avatar must be a string' })
  @IsOptional()
  avatar?: string;
}
