import {
  CreatedTimeColumn,
  DeletedTimeColumn,
  IntegerColumn,
  UpdatedTimeColumn,
  UserIdColumn,
} from './../decorators/column.decorator';

export class ModifiedInfo {
  @IntegerColumn({
    name: 'display_order',
    length: 11,
    nullable: true,
  })
  public displayOrder: number;

  @CreatedTimeColumn()
  public createdTime: Date;

  @UserIdColumn({
    name: 'created_by',
    nullable: true,
  })
  public createdBy: string;

  @UpdatedTimeColumn()
  public updatedTime: Date;

  @UserIdColumn({
    name: 'updated_by',
    nullable: true,
  })
  public updatedBy: string;

  @DeletedTimeColumn()
  public deletedTime: Date;

  @UserIdColumn({
    name: 'deleted_by',
    nullable: true,
  })
  public deletedBy: string;
}
