import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

export enum EScentConfigType {
  SCENT = 1,
  BLENDED = 2,
}

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

export interface IScentColor {
  base: string;
  gradient: { color: string; percent: number }[];
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

  @Column({ name: 'type', type: 'enum', enum: EScentConfigType, nullable: true })
  type: EScentConfigType;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'notes', type: 'json', nullable: true })
  notes: IScentNote[];

  @Column({ name: 'color', type: 'json', nullable: true })
  color: IScentColor;
}
