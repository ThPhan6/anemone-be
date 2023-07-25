import { Column, Entity, OneToMany } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { SecurityGroupPolicyEntity } from './security-group-policy.entity';

@Entity({ name: 'security_groups' })
export class SecurityGroupEntity extends AutoIdEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column({ name: 'is_default', default: true })
  isDefault: boolean;

  @OneToMany(() => SecurityGroupPolicyEntity, securityGroupPolicy => securityGroupPolicy.securityGroup)
  SecurityGroupPolicyEntity: SecurityGroupPolicyEntity[];
}
