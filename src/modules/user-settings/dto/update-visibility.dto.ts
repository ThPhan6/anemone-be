import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  wifiEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  personalise?: boolean;

  @IsOptional()
  scheduleTimer?: any;

  @IsOptional()
  system?: any;

  @IsOptional()
  device?: any;

  @IsOptional()
  network?: any;

  @IsOptional()
  systemUpdate?: any;

  @IsOptional()
  wifiConnections?: any;

  @ApiProperty({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean;
}
