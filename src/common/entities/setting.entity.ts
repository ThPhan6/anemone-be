import { SettingDataType, SettingType } from 'common/enums/setting.enum';
import { Column, Entity } from 'typeorm';

import { BaseEntityNumberId } from './base.entity';

@Entity('settings')
export class Setting extends BaseEntityNumberId {
  @Column()
  public name: string;

  @Column()
  public value: string;

  @Column({ type: 'enum', enum: SettingType })
  public type: SettingType;

  @Column({
    type: 'enum',
    enum: SettingDataType,
    default: SettingDataType.STRING,
    name: 'data_type',
  })
  public dataType: SettingDataType;
}
