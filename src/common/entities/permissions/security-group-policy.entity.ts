import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { PolicyEntity } from './policy.entity';
import { SecurityGroupEntity } from './security-groups.entity';

@Entity({ name: 'security_group_policy' })
export class SecurityGroupPolicyEntity extends AutoIdEntity {
  @ManyToOne(() => SecurityGroupEntity, (securityGroup: SecurityGroupEntity) => securityGroup.id)
  @JoinColumn({ name: 'security_group_id' })
  securityGroup: SecurityGroupEntity;

  @ManyToOne(() => PolicyEntity, (policy: PolicyEntity) => policy.id)
  @JoinColumn({ name: 'policy_id' })
  policy: PolicyEntity;
}
