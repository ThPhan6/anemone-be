import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AutoUUIDEntity } from './entity';
import { User } from './user.entity';

@Entity('activity_logs')
export class ActivityLog extends AutoUUIDEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column({
    name: 'target_id',
    type: 'uuid',
  })
  public targetId: string;

  @Column({
    name: 'target_type',
    length: 64,
  })
  public targetType: string;

  @Column()
  public action: string;

  @Column({ type: 'json', name: 'old_data' })
  public oldData: Record<string, any>;

  @Column({ type: 'json', name: 'new_data' })
  public newData: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt: Date;
}
