import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { DeviceCartridge } from './device-cartridge.entity';
import { Family } from './family.entity';
import { Product } from './product.entity';
import { Space } from './space.entity';
import { User } from './user.entity';

@Entity('devices')
export class Device extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'warranty_expiration_date', nullable: true })
  warrantyExpirationDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  registeredBy: User;

  @Column({ name: 'is_connected', default: false })
  isConnected: boolean;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'serial_number' })
  serialNumber: string;

  @ManyToOne(() => Space, (space) => space.devices)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => Family, (family) => family.devices)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @OneToMany(() => DeviceCartridge, (cartridge) => cartridge.device)
  cartridges: DeviceCartridge[];
}
