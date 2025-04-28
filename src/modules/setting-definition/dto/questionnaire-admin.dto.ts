import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { ESystemDefinitionType } from '../entities/setting-definition.entity';
import { QuestionnaireAnswerType } from '../entities/setting-value.entity';

// DTO for setting definition metadata
export class QuestionMetadataDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsPositive()
  index: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsPositive()
  max: number;
}

// DTO for answer metadata
export class AnswerMetadataDto {
  @ApiProperty({
    description: 'Type of answer (tag, image-card)',
    required: true,
    enum: QuestionnaireAnswerType,
  })
  @IsEnum(QuestionnaireAnswerType)
  @IsNotEmpty()
  type: QuestionnaireAnswerType;
}

// DTO for answer items
export class QuestionnaireAnswerItemDto {
  @ApiProperty({
    description: 'Answer value text (required for TAG type)',
    required: true,
  })
  @IsString()
  @ValidateIf((o) => o.metadata?.type === QuestionnaireAnswerType.TAG)
  @IsNotEmpty({ message: 'Value is required for TAG type answers' })
  value: string;

  @ApiProperty({
    description: 'Answer metadata',
    required: true,
    type: AnswerMetadataDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => AnswerMetadataDto)
  metadata: AnswerMetadataDto;
}

// DTO for creating a questionnaire
export class QuestionnaireAdminCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionMetadataDto)
  metadata: QuestionMetadataDto;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionnaireAnswerItemDto)
  settingDefinition: QuestionnaireAnswerItemDto[];
}

// DTO for updating a questionnaire
export class QuestionnaireAdminUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsEnum(ESystemDefinitionType)
  @IsOptional()
  type?: ESystemDefinitionType;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => QuestionMetadataDto)
  metadata?: QuestionMetadataDto;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionnaireAnswerItemDto)
  settingDefinition?: QuestionnaireAnswerItemDto[];
}
