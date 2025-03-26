import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Device } from './device.entity';

export enum CertificateStatus {
  PENDING = 'PENDING', // Created but not yet active
  ACTIVE = 'ACTIVE', // Currently in use
  INACTIVE = 'INACTIVE', // Expired normally
  REVOKED = 'REVOKED', // Forcefully invalidated
  PENDING_TRANSFER = 'PENDING_TRANSFER',
}

@Entity('device_certificates')
export class DeviceCertificate extends BaseEntity {
  @Column({ name: 'certificate_id', unique: true })
  certificateId: string; // AWS IoT certificate ID

  @Column({ name: 'certificate_arn' })
  certificateArn: string; // AWS IoT certificate ARN

  @Column({ name: 'certificate_s3_key' })
  certificateS3Key: string; // S3 key for stored certificate

  @Column({ name: 'private_key_s3_key' })
  privateKeyS3Key: string; // S3 key for stored private key (temporary)

  @Column({
    name: 'status',
    type: 'enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING,
  })
  status: CertificateStatus;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date;

  @ManyToOne(() => Device, (device) => device.certificates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;
}
