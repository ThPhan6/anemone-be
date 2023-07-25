import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { PermissionGroupEntity } from './permission-groups.entity';

@Entity({ name: 'permissions' })
export class PermissionEntity extends AutoIdEntity {
  @Column()
  title: string;

  @Column()
  type: number;

  @Column()
  key: string;

  @Column()
  description: string;

  @ApiProperty({ type: PermissionGroupEntity })
  @ManyToOne(() => PermissionGroupEntity, (permissionGroup: PermissionGroupEntity) => permissionGroup.id)
  @JoinColumn({ name: 'group_id' })
  group: PermissionGroupEntity;
}
