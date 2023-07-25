import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { PermissionEntity } from './permissions.entity';
import { SecurityGroupEntity } from './security-groups.entity';

@Entity({ name: 'permission_security_group' })
export class PermissionSecurityGroupEntity extends AutoIdEntity {
  @ManyToOne(() => SecurityGroupEntity, (securityGroup: SecurityGroupEntity) => securityGroup.id)
  @JoinColumn({ name: 'security_group_id' })
  securityGroup: SecurityGroupEntity;

  @ManyToOne(() => PermissionEntity, (permission: PermissionEntity) => permission.id, {})
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
