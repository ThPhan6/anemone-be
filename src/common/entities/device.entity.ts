import { DeviceType } from 'common/enums/device.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntityNumberId } from './base.entity';
import { Setting } from './setting.entity';
import { User } from './user.entity';

@Entity('devices')
export class Device extends BaseEntityNumberId {
  @Column()
  public name: string;

  @Column({ type: 'enum', enum: DeviceType })
  public type: DeviceType;

  @ManyToOne(() => Setting)
  @JoinColumn({ name: 'category_id' })
  public category: Setting;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  public createdBy: User;
}
