import { Column, Entity, Generated } from 'typeorm';

import { CreatedTimeColumn, DeletedTimeColumn } from '../decorators/column.decorator';
import { AutoIdEntity } from './entity';

@Entity('forgot_password')
export class ForgotPasswordEntity extends AutoIdEntity {
  @Generated('uuid')
  @Column({ name: 'code' })
  public code: string;

  @Column({ name: 'user_id' })
  public userId: string;

  @Column({ name: 'expired_at', type: 'timestamptz' })
  public expiredAt: Date;

  @CreatedTimeColumn()
  public createdTime: Date;

  @DeletedTimeColumn()
  public deletedTime: Date;
}
