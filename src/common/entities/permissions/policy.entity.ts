import { Column, Entity, OneToMany } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { PolicyPermissionEntity } from './policy-permission.entity';

@Entity({ name: 'policy' })
export class PolicyEntity extends AutoIdEntity {
  @Column()
  order: number;

  @Column()
  title: string;

  @Column()
  type: number;

  @Column()
  key: string;

  @Column()
  description: string;

  @OneToMany(() => PolicyPermissionEntity, policyPermissions => policyPermissions.policy)
  policyPermissions: PolicyPermissionEntity[];
}
