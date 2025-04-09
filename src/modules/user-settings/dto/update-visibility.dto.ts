import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateVisibilityDto {
  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
