import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { SettingDefinition } from './setting-definition.entity';

export enum QuestionnaireAnswerType {
  IMAGE_CARD = 'image-card',
  TAG = 'tag',
}

export interface SystemSettingMetadata {
  name?: string | null;
  type?: QuestionnaireAnswerType | string | null;
  image?: string | null;
}

@Entity('setting_values')
export class SettingValue extends BaseEntity {
  @Column({ name: 'value', type: 'varchar' })
  value: string;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: SystemSettingMetadata;

  @ManyToOne(() => SettingDefinition, (definition) => definition.values)
  @JoinColumn({ name: 'setting_definition_id' })
  settingDefinition: SettingDefinition;
}
