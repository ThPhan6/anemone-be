import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEventTrackingDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsNotEmpty()
  @IsNumber()
  timestamp: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['CLICK', 'PLAY', 'LIKE'])
  eventType: 'CLICK' | 'PLAY' | 'LIKE';

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 10 }) // optional limit decimal places
  eventValue: number;
}
