import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddScentToPlayListDto {
  @ApiProperty({
    example: '2ab34e45-092e-4f28-b78c-942b427208eb',
  })
  @IsString()
  @IsNotEmpty()
  scentId: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  sequence: number;
}
