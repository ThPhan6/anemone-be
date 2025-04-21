import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsArray, ValidateNested } from 'class-validator';

import { ScentNoteDto, ScentStoryDto } from './scent-config.dto';

export class CreateScentConfigDto {
  @ApiProperty()
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  code: string;

  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

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
