import { UsageHistoryType } from 'common/enums/device.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('usage_histories')
export class UsageHistory extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column({
    name: 'used_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public usedAt: Date;

  @Column({ type: 'enum', enum: UsageHistoryType, name: 'usage_type' })
  public usageType: UsageHistoryType;

  @Column({
    name: 'usage_id',
    length: 64,
  })
  public usageId: string;
}
