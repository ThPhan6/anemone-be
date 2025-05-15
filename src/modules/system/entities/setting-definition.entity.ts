import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { SettingValue } from './setting-value.entity';

export enum ESystemDefinitionType {
  QUESTIONNAIRE = 1,
  SCENT_TAG = 2,
  SCENT_NOTES = 3,
}

export interface IMetadata {
  name?: string | null;
  image?: string | null;
  index?: number | null;
  max?: number | null;
}

@Entity('setting_definitions')
export class SettingDefinition extends BaseEntity {
  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'type', type: 'varchar', enum: ESystemDefinitionType })
  type: ESystemDefinitionType;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: IMetadata;

  @OneToMany(() => SettingValue, (value) => value.settingDefinition)
  values: SettingValue[];
}
