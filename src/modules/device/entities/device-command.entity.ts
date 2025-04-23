import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Device } from './device.entity';

export enum CommandType {
  PLAY = 'play',
  PAUSE = 'pause',
  TEST = 'test',
}

@Entity('device_commands')
export class DeviceCommand extends BaseEntity {
  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ name: 'command', type: 'json' })
  command: Record<string, any>;

  @Column({ name: 'is_executed', default: false })
  isExecuted: boolean;
}
