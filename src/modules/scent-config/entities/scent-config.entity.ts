import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

export enum EScentNoteType {
  TOP = 'top',
  MIDDLE = 'middle',
  BASE = 'base',
}

export interface IScentNote {
  ingredients: string[];
  type: EScentNoteType;
  image: string;
}

export interface IScenStory {
  content: string;
  image: string;
}

@Entity('scent_configs')
export class ScentConfig extends BaseEntity {
  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'varchar' })
  description: string;

  @Column({ name: 'background', type: 'varchar' })
  background: string;

  @Column({ name: 'story', type: 'json' })
  story: IScenStory;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'notes', type: 'json', nullable: true })
  notes: IScentNote[];
}
