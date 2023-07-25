import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { FlagColumn, NoteColumn, NowColumn } from './../decorators/column.decorator';
import { ModifiedInfoColumn } from './../decorators/modifiedInfo.decorator';
import { AutoUUIDEntity } from './entity';
import { ModifiedInfo } from './modifiedInfo';

@Entity('user')
export class UserEntity extends AutoUUIDEntity {
  @Column({
    name: 'user_name',
    length: 64,
  })
  public userName: string;

  @Column({
    length: 100,
  })
  @Exclude({ toPlainOnly: true })
  public password: string;

  @Column({
    name: 'mail_address',
    length: 128,
    unique: true,
  })
  public mailAddress: string;

  @Column({
    name: 'login_name',
    length: 64,
    nullable: true,
    unique: true,
  })
  public loginName: string;

  @NowColumn('password_update_time')
  public passwordUpdateTime: Date;

  @Column({
    name: 'last_login_time',
    type: 'timestamptz',
    nullable: true,
  })
  public lastLoginTime: Date;

  @FlagColumn('invalid_flg')
  public invalidFlg: boolean;

  @NoteColumn()
  public note: string;

  @ModifiedInfoColumn()
  public modifiedInfo: ModifiedInfo;
}
