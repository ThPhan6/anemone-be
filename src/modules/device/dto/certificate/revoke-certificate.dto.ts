import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RevokeCertificateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  certificateId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
