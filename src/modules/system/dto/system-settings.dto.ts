import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { SystemSettingsType } from '../../../common/enum/system-settings.enum';
import {
  CreateScentConfigDto,
  UpdateScentConfigDto,
} from '../../scent-config/dto/scent-config.dto';
import { QuestionnaireAdminCreateDto } from './questionnaire-admin.dto';
import { CreateScentTagDto, UpdateScentTagDto } from './scent-tag.dto';

@ApiExtraModels(
  CreateScentTagDto,
  UpdateScentTagDto,
  CreateScentConfigDto,
  UpdateScentConfigDto,
  QuestionnaireAdminCreateDto,
)
export class CreateSystemSettingDto {
  @ApiProperty({
    enum: SystemSettingsType,
    description: '1: Questionnaire, 2: Scent Tag, 3: Scent Config',
  })
  @IsEnum(SystemSettingsType)
  _type: SystemSettingsType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateScentTagDto) },
      { $ref: getSchemaPath(UpdateScentTagDto) },
      { $ref: getSchemaPath(CreateScentConfigDto) },
      { $ref: getSchemaPath(UpdateScentConfigDto) },
      {
        type: 'array',
        items: { $ref: getSchemaPath(QuestionnaireAdminCreateDto) },
      },
    ],
  })
  data:
    | { questionnaires: QuestionnaireAdminCreateDto[] }
    | CreateScentTagDto
    | UpdateScentTagDto
    | CreateScentConfigDto
    | UpdateScentConfigDto;
}
