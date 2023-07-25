import { AutoIdColumn } from './../decorators/column.decorator';

export abstract class AutoIdEntity {
  @AutoIdColumn('number')
  public id: number;
}

export abstract class AutoUUIDEntity {
  @AutoIdColumn('uuid')
  public id: string;
}
