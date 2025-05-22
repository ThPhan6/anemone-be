import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { CommandType } from '../../entities/device-command.entity';

export class CommandDto {
  @ApiProperty({ example: 'dc27e054-5482-4e0e-bd14-59e72645425a' })
  @IsString()
  @IsNotEmpty()
  scentId: string;

  @ApiProperty({ enum: CommandType, example: CommandType.PLAY })
  @IsEnum(CommandType)
  type: CommandType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsOptional()
  duration?: number;
}
