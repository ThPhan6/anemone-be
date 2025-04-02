import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class QuestionnaireAnswerDto {
  @ApiProperty({
    example: [{ questionId: '8a72aa0a-f492-4e86-bd8f-ca3340320c1', answer: 'Sleep' }],
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

  @IsString()
  @IsNotEmpty()
  answer: string;
}
