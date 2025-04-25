import { IMetadata } from '../entities/setting-definition.entity';
import { SystemSettingMetadata } from '../entities/setting-value.entity';

export interface AnswerDto {
  id: string;
  value: string;
  metadata: SystemSettingMetadata;
}

export interface SettingWithAnswersDto {
  id: string;
  name: string;
  metadata: IMetadata;
  answers: AnswerDto[];
}
