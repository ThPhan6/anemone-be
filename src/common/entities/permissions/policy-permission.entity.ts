import { ApiProperty } from '@nestjs/swagger';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { PermissionEntity } from './permissions.entity';
import { PolicyEntity } from './policy.entity';

@Entity({ name: 'policy_permission' })
export class PolicyPermissionEntity extends AutoIdEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PolicyEntity, (policy: PolicyEntity) => policy.id)
  @JoinColumn({ name: 'policy_id' })
  policy: PolicyEntity;

  @ManyToOne(() => PermissionEntity, (permission: PermissionEntity) => permission.id)
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
