import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScentTagDto {
  @ApiProperty({ description: 'Name of the scent tag', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the scent tag', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateScentTagDto extends PartialType(CreateScentTagDto) {}
