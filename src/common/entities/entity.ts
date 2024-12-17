import { PrimaryGeneratedColumn } from 'typeorm';

import { AutoIdColumn } from './../decorators/column.decorator';

export abstract class AutoIdEntity {
  @AutoIdColumn('number')
  public id: number;
}

export abstract class AutoUUIDEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
}
