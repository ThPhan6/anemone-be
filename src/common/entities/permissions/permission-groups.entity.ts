import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AutoIdEntity } from '../entity';
import { PermissionEntity } from './permissions.entity';

@Entity({ name: 'permission_groups' })
export class PermissionGroupEntity extends AutoIdEntity {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => PermissionGroupEntity, (permissionGroup: PermissionGroupEntity) => permissionGroup.id)
  @JoinColumn({ name: 'parent_id' })
  parent: PermissionGroupEntity;

  @OneToMany(() => PermissionEntity, permissions => permissions.group)
  permissions: PermissionEntity[];
}
