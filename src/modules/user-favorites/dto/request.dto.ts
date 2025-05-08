import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { FavoriteType } from '../../../common/entities/user-favorites.entity';

export class CreateUserFavoriteDto {
  @ApiProperty({
    example: 'scent',
  })
  @IsEnum(FavoriteType)
  type: FavoriteType;

  @ApiProperty({
    example: '8a72aa0a-f492-4e86-bd8f-ca3340320c1',
  })
  @IsString()
  @IsNotEmpty()
  relationId: string;
}
