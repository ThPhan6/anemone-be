import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'jsonb', nullable: true })
  chore: Record<string, any>;
}
