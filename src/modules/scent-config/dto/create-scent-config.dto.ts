import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { IsArray, ValidateNested } from 'class-validator';

import { SystemSettingsType } from '../../../common/enum/system-settings.enum';
import {
  ScentColorDto,
  ScentNoteDto,
  ScentStoryDto,
} from '../../scent-config/dto/scent-config.dto';

export class CreateScentConfigDto {
  @ApiProperty({ required: true })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  code: string;

  @ApiProperty({ required: true })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  name: string;

  @ApiProperty({ required: true })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  title: string;

  @ApiProperty({ type: [ScentStoryDto], required: true })
  @ValidateNested({ each: true })
  @Type(() => ScentStoryDto)
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  color: ScentColorDto;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  background: string;

  @ApiProperty({ type: [ScentStoryDto] })
  @ValidateNested({ each: true })
  @Type(() => ScentStoryDto)
  @IsOptional()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  story: ScentStoryDto;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ type: [ScentNoteDto] })
  @ValidateNested({ each: true })
  @Type(() => ScentNoteDto)
  @IsOptional()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_CONFIG)
  notes: ScentNoteDto[];
}
