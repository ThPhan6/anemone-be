import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { UserEntity } from '../user.entity';
import { SecurityGroupEntity } from './security-groups.entity';

@Entity({ name: 'security_group_member' })
export class SecurityGroupMemberEntity extends AutoIdEntity {
  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id)
  @JoinColumn({ name: 'added_by' })
  addedBy: UserEntity;

  @ManyToOne(() => SecurityGroupEntity, (securityGroup: SecurityGroupEntity) => securityGroup.id)
  @JoinColumn({ name: 'security_group_id' })
  securityGroup: SecurityGroupEntity;
}
