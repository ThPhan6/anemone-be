import { ApiProperty } from '@nestjs/swagger';

export class ProvisioningResponseDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  certificateId: string;

  @ApiProperty()
  certificateUrl: string;

  @ApiProperty()
  privateKeyUrl: string;

  @ApiProperty()
  thingName: string;
}
