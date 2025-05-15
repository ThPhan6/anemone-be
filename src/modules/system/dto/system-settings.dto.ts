import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { SystemSettingsType } from '../../../common/enum/system-settings.enum';
import { CreateScentConfigDto } from './create-scent-config.dto';
import { QuestionnaireAdminCreateDto } from './questionnaire-admin.dto';
import { CreateScentTagDto } from './scent-tag.dto';

@ApiExtraModels(CreateScentTagDto, CreateScentConfigDto, QuestionnaireAdminCreateDto)
export class CreateSystemSettingDto {
  @ApiProperty({
    enum: SystemSettingsType,
    description: '1: Questionnaire, 2: Scent Tag, 3: Scent Config',
  })
  @IsEnum(SystemSettingsType)
  type: SystemSettingsType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateScentTagDto) },
      { $ref: getSchemaPath(CreateScentConfigDto) },
      {
        type: 'array',
        items: { $ref: getSchemaPath(QuestionnaireAdminCreateDto) },
      },
    ],
  })
  data:
    | { questionnaires: QuestionnaireAdminCreateDto[] }
    | CreateScentTagDto
    | CreateScentConfigDto;
}
