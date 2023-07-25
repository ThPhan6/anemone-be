import { Column, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export function AutoIdColumn(options: 'number' | 'uuid'): PropertyDecorator {
  if (options === 'uuid') {
    return PrimaryGeneratedColumn('uuid');
  }

  return PrimaryGeneratedColumn('increment', { type: 'bigint' });
}

export function IntegerColumn(options: {
  name?: string;
  length: number;
  nullable?: boolean;
  default?: any;
  unique?: boolean;
}): PropertyDecorator {
  options['type'] = 'numeric';
  options['precision'] = options.length;
  options['scale'] = 0;
  options.length = undefined;

  return Column(options);
}

export function UserIdColumn(options: { name: string; nullable?: boolean }): PropertyDecorator {
  return Column({ name: options.name, type: 'bigint', nullable: options.nullable });
}

export function MenuCodeColumn(
  options: { name?: string; nullable?: boolean; unique?: boolean } = { name: null, nullable: null, unique: null },
): PropertyDecorator {
  return Column({ name: options.name ?? 'menu_code', length: 4, nullable: options.nullable, unique: options.unique });
}

export function CreatedTimeColumn(): PropertyDecorator {
  return CreateDateColumn({ name: 'created_at', type: 'timestamptz' });
}

export function UpdatedTimeColumn(): PropertyDecorator {
  return UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' });
}

export function DeletedTimeColumn(): PropertyDecorator {
  return DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true });
}

export function FlagColumn(name?: string): PropertyDecorator {
  return Column({ name: name, default: false });
}

export function NoteColumn(name?: string): PropertyDecorator {
  return Column({ name: name ?? 'note', length: 400, nullable: true });
}

export function NowColumn(name?: string): PropertyDecorator {
  return Column({ name: name, type: 'timestamptz', default: 'now()' });
}

export function GeoComponentColumn(options: { name: string; nullable?: boolean }): PropertyDecorator {
  return Column({ name: options.name, type: 'numeric', precision: 13, scale: 10, nullable: options.nullable });
}

export function TripCodeColumn(
  options: { name?: string; nullable?: boolean; unique?: boolean } = {},
): PropertyDecorator {
  return Column({ name: options.name ?? 'trip_code', length: 30, nullable: options.nullable, unique: options.unique });
}

export function HistoryNoColumn(): PropertyDecorator {
  return Column({ name: 'history_no', type: 'smallint' });
}

export function UserClassColumn(): PropertyDecorator {
  return Column({ name: 'user_class', length: 4 });
}
