import { IMetadata } from '../entities/setting-definition.entity';
import { SystemSettingMetadata } from '../entities/setting-value.entity';

export interface SettingValueDto {
  id: string;
  value: string;
  metadata: SystemSettingMetadata;
}

export interface SettingDefinitionResDto {
  id: string;
  name: string;
  metadata: IMetadata;
  settingDefinition: SettingValueDto[];
}
