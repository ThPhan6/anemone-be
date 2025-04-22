import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ScentColorDto, ScentNoteDto, ScentStoryDto } from './scent-config.dto';

export class UpdateScentConfigDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ type: [ScentStoryDto] })
  @ValidateNested({ each: true })
  @Type(() => ScentStoryDto)
  @IsOptional()
  color: ScentColorDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  background: string;

  @ApiProperty({ type: [ScentStoryDto] })
  @ValidateNested({ each: true })
  @Type(() => ScentStoryDto)
  @IsOptional()
  story: ScentStoryDto;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ type: [ScentNoteDto] })
  @ValidateNested({ each: true })
  @Type(() => ScentNoteDto)
  @IsOptional()
  notes: ScentNoteDto[];
}
