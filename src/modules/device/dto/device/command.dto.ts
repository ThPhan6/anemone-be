import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommandDto {
  @ApiProperty({ example: 'dc27e054-5482-4e0e-bd14-59e72645425a' })
  @IsString()
  @IsNotEmpty()
  scentId: string;
}
