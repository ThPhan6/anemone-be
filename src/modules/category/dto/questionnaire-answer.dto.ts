import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class QuestionnaireAnswerDto {
  @ApiProperty({
    example: [
      {
        questionId: '8a72aa0a-f492-4e86-bd8f-ca3340320c1',
        answers: ['Sleep'],
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => QuestionnaireAnswerItem)
  answers: QuestionnaireAnswerItem[];
}

export class QuestionnaireAnswerItem {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Type(() => String)
  answers: string[];
}
