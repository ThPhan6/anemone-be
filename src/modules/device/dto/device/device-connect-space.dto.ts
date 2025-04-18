import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class DeviceConnectSpaceDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  spaceId: string;
}

export class DeviceUpdateStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isConnected: boolean;
}
