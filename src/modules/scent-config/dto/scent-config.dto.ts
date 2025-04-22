import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsArray } from 'class-validator';

import { EScentNoteType } from '../entities/scent-config.entity';

export class ScentNoteDto {
  @ApiProperty({ type: [String], required: true })
  @IsArray({ message: 'Ingredients must be an array' })
  @IsNotEmpty({ each: true, message: 'Each ingredient must not be empty' })
  ingredients: string[];

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Scent note type is required' })
  type: EScentNoteType;

  @ApiProperty()
  image: string;
}

export class ScentStoryDto {
  @ApiProperty()
  content: string;

  @ApiProperty()
  image: string;
}
