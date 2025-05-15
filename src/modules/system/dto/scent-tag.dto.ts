import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

import { SystemSettingsType } from '../../../common/enum/system-settings.enum';

export class CreateScentTagDto {
  @ApiProperty({ description: 'Name of the scent tag', required: true })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_TAG)
  name: string;

  @ApiProperty({ description: 'Description of the scent tag', required: false })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === SystemSettingsType.SCENT_TAG)
  description?: string;
}

export class UpdateScentTagDto extends PartialType(CreateScentTagDto) {}
