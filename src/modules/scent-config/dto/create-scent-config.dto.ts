import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IScenStory, IScentNote } from '../entities/scent-config.entity';

export class CreateScentConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsOptional()
  story: IScenStory;

  @ApiProperty()
  @IsString()
  @IsOptional()
  background: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty()
  @IsOptional()
  notes: IScentNote[];
}
