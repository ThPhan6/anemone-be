import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SystemSettingsType } from 'common/enum/system-settings.enum';

import { EScentNoteType } from '../entities/scent-config.entity';

export class ScentNoteDto {
  @ApiProperty({
    type: [String],
    description: 'Array of 1-3 ingredients',
    minItems: 1,
    maxItems: 3,
    example: ['Lavender', 'Bergamot'],
  })
  @IsArray({ message: 'Ingredients must be an array' })
  @ArrayMinSize(1, { message: 'At least 1 ingredient is required' })
  @ArrayMaxSize(3, { message: 'Maximum 3 ingredients allowed' })
  @IsNotEmpty({ each: true, message: 'Each ingredient must not be empty' })
  @IsString({ each: true, message: 'Each ingredient must be a string' })
  ingredients: string[];

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Scent note type is required' })
  type: EScentNoteType;
}

export class ScentStoryDto {
  @ApiProperty()
  content: string;
}

export class ScentColorDto {
  @ApiProperty()
  base: string;

  @ApiProperty({
    type: [String],
    description: 'Array of exactly 2 gradient colors',
    minItems: 2,
    maxItems: 2,
    example: ['#FF0000', '#00FF00'],
  })
  @IsArray({ message: 'Gradient must be an array' })
  @ArrayMinSize(2, { message: 'Gradient must have exactly 2 colors' })
  @ArrayMaxSize(2, { message: 'Gradient must have exactly 2 colors' })
  @IsString({ each: true, message: 'Each gradient color must be a string' })
  gradient: string[];
}

export class CreateScentConfigDto {
  @ApiProperty({
    required: false,
    description: 'Code is optional but must be unique if provided',
  })
  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code cannot be empty if provided' })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  code?: string;

  @ApiProperty({
    required: false,
    description: 'Name is optional but cannot be empty if provided',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty if provided' })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  name?: string;

  @ApiProperty({
    required: false,
    description: 'Title is optional but cannot be empty if provided',
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty if provided' })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  title?: string;

  @ApiProperty({
    type: ScentColorDto,
    required: false,
    description: 'Color is optional but must follow validation rules if provided',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScentColorDto)
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  color?: ScentColorDto;

  @ApiProperty({
    required: false,
    description: 'Description is optional',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  description?: string;

  @ApiProperty({
    type: ScentStoryDto,
    required: false,
    description: 'Story is optional but must follow validation rules if provided',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScentStoryDto)
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  story?: ScentStoryDto;

  @ApiProperty({
    description: 'Array of tag IDs from setting_definition table (1-3 tags required if provided)',
    type: [String],
    required: false,
    minItems: 1,
    maxItems: 3,
    example: ['tag1', 'tag2'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least 1 tag is required if tags are provided' })
  @ArrayMaxSize(3, { message: 'Maximum 3 tags allowed' })
  @IsString({ each: true })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  tags?: string[];

  @ApiProperty({
    type: [ScentNoteDto],
    required: false,
    description: 'Notes are optional but must follow validation rules if provided',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ScentNoteDto)
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  notes?: ScentNoteDto[];
}

export class DeletedFileDto {
  @ApiProperty({
    description: 'Key of the file to delete (background, story, or notes_0, notes_1, notes_2)',
    example: 'background',
  })
  key: string;

  @ApiProperty({
    description: 'The actual image name/key stored in database',
    example: 'mask_2.png',
  })
  image: string;
}

export class UpdateScentConfigDto extends PartialType(CreateScentConfigDto) {
  @ApiProperty({
    description: 'Array of files to be deleted',
    type: [DeletedFileDto],
    required: false,
  })
  deletedFiles?: DeletedFileDto[];
}
