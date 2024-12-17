import { SettingType } from 'common/enums/setting.enum';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity('settings')
export class Setting extends BaseEntity {
  @Column()
  public name: string;

  @Column()
  public value: string;

  @Column({ type: 'enum', enum: SettingType })
  public type: SettingType;
}
