import { Expose, Transform } from 'class-transformer';
import { BaseEntity } from 'common/entities/base.entity';
import { Family } from 'common/entities/family.entity';
import { Space } from 'common/entities/space.entity';
import { DeviceCartridge } from 'modules/device/entities/device-cartridge.entity';
import { Product } from 'modules/device/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { DeviceCertificate } from './device-certificate.entity';

export enum DeviceProvisioningStatus {
  PENDING = 'PENDING',
  PROVISIONED = 'PROVISIONED',
  FAILED = 'FAILED',
}

export enum ConnectionStatus {
  CONNECTED = 1,
  DISCONNECTED_BY_DEVICE = 2,
  DISCONNECTED_BY_USER = 3,
}

@Entity('devices')
export class Device extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'thing_name', nullable: true })
  thingName: string;

  @Column({
    name: 'provisioning_status',
    type: 'enum',
    enum: DeviceProvisioningStatus,
    default: DeviceProvisioningStatus.PENDING,
  })
  provisioningStatus: DeviceProvisioningStatus;

  @Column({ name: 'firmware_version', nullable: true })
  firmwareVersion: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ name: 'connection_status', default: ConnectionStatus.DISCONNECTED_BY_DEVICE })
  connectionStatus: ConnectionStatus;

  @Column({ name: 'last_ping_at', nullable: true })
  lastPingAt: Date;

  @Column({ name: 'warranty_expiration_date', nullable: true })
  warrantyExpirationDate: Date;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'serial_number', referencedColumnName: 'serialNumber' })
  product: Product;

  @Column({ name: 'registered_by', nullable: true })
  registeredBy: string;

  @ManyToOne(() => Space, (space) => space.devices)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => Family, (family) => family.devices)
  @JoinColumn({ name: 'family_id' })
  family: Family;

  @OneToMany(() => DeviceCartridge, (cartridge) => cartridge.device)
  cartridges: DeviceCartridge[];

  @OneToMany(() => DeviceCertificate, (certificate) => certificate.device)
  certificates: DeviceCertificate[];

  @Expose()
  @Transform(({ obj }) => obj.product?.serialNumber)
  get deviceId(): string {
    return this.product?.serialNumber;
  }

  @Expose()
  @Transform(({ obj }) => obj.connectionStatus === ConnectionStatus.CONNECTED)
  get isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }
}
