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

import { SystemSettingsType } from '../../../common/enum/system-settings.enum';
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

  @ApiProperty({
    description: 'URL of the question image, or null to remove',
    required: false,
    nullable: true, // Allows explicit null
  })
  @IsString()
  @IsOptional()
  // @ValidateIf((o) => o.image !== null) // Optional: add if you need validation for string format when not null
  image?: string | null; // This allows 'image' to be present as a string or null
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

// DTO for answer items (used for creation, id is optional)
export class QuestionnaireAnswerItemDto {
  @ApiProperty({
    description: 'ID of the answer (optional for creation, required for update)',
    required: false, // Optional for creation
  })
  @IsString()
  @IsOptional() // Make it optional for creation scenarios
  id?: string; // Add the id property here

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

// DTO for answer items when updating (id is required)
export class QuestionnaireAnswerUpdateItemDto extends QuestionnaireAnswerItemDto {
  @ApiProperty({
    description: 'ID of the answer (required for update)',
    required: true, // Required for update
  })
  @IsString()
  @IsNotEmpty() // Ensure it's not an empty string
  id: string; // Override to make it required
}

// DTO for creating a questionnaire
export class QuestionnaireAdminCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  name: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => QuestionMetadataDto)
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  metadata: QuestionMetadataDto;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionnaireAnswerItemDto) // Uses the base DTO where ID is optional
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  values: QuestionnaireAnswerItemDto[];
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
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  name?: string;

  @ApiProperty()
  @IsEnum(ESystemDefinitionType)
  @IsOptional()
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  type?: ESystemDefinitionType;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => QuestionMetadataDto)
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  metadata?: QuestionMetadataDto;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionnaireAnswerUpdateItemDto) // Uses the new DTO where ID is required
  @ValidateIf((o) => o.type === SystemSettingsType.QUESTIONNAIRE)
  values?: QuestionnaireAnswerUpdateItemDto[]; // Updated type to use the new DTO
}
