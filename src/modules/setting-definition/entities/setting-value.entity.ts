import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { SettingDefinition } from './setting-definition.entity';

interface SystemSettingMetadata {
  name: string;
  type: string;
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
