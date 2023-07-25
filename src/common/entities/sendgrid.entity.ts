import { Column, Entity } from 'typeorm';

import { ModifiedInfoColumn } from '../decorators/modifiedInfo.decorator';
import { AutoIdEntity } from './entity';
import { ModifiedInfo } from './modifiedInfo';

@Entity('sendgrid')
export class SendgridEntity extends AutoIdEntity {
  @Column({
    name: 'sendgrid_id',
    length: 256,
  })
  public sendgridId: string;

  @Column({
    name: 'mail_address',
    length: 128,
  })
  public mailAddress: string;

  @Column({
    type: 'smallint',
    nullable: true,
  })
  public status: number;

  @Column({
    name: 'mail_type',
    length: 10,
    nullable: true,
  })
  public mailType: string;

  @ModifiedInfoColumn()
  public modifiedInfo: ModifiedInfo;
}
