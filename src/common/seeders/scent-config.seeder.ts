import { DataSource } from 'typeorm';

import {
  EScentNoteType,
  ScentConfig,
} from '../../modules/scent-config/entities/scent-config.entity';
import { BaseSeeder } from './base.seeder';

const records = [
  {
    code: 'S01',
    name: 'Scent 1',
    title: 'Scent 1 Title',
    background: '',
    tags: ['AROMATIC', 'HERBAL', 'WOODY'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: '',
    },
    notes: [{ ingredients: ['Lavender'], type: EScentNoteType.TOP, image: '' }],
  },
  {
    code: 'R01',
    name: 'Scent 2',
    title: 'Scent 2 Title',
    background: '',
    tags: ['FLORAL', 'WHITE', 'FLORAL'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: '',
    },
    notes: [{ ingredients: ['Rose'], type: EScentNoteType.MIDDLE, image: '' }],
  },
  {
    code: 'I01',
    name: 'Scent 3',
    title: 'Scent 3 Title',
    background: '',
    tags: ['GREEN', 'MINT'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: '',
    },
    notes: [{ ingredients: ['Mint'], type: EScentNoteType.TOP, image: '' }],
  },
  {
    code: 'H01',
    name: 'Scent 4',
    title: 'Scent 4 Title',
    background: '',
    tags: ['GREEN', 'FRUITY', 'MUSKY'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: '',
    },
    notes: [
      { ingredients: ['Green Apple'], type: EScentNoteType.TOP, image: '' },
      { ingredients: ['Musk'], type: EScentNoteType.BASE, image: '' },
    ],
  },
  {
    code: 'F01',
    name: 'Scent 5',
    title: 'Scent 5 Title',
    background: '',
    tags: ['SPICY', 'WOODY', 'CITRUS'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: '',
    },
    notes: [
      { ingredients: ['Cinnamon'], type: EScentNoteType.TOP, image: '' },
      { ingredients: ['Cedarwood'], type: EScentNoteType.MIDDLE, image: '' },
      { ingredients: ['Orange'], type: EScentNoteType.TOP, image: '' },
    ],
  },
  {
    code: 'E01',
    name: 'Scent 6',
    title: 'Scent 6 Title',
    background: '',
    tags: ['GREEN', 'MINT'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: '',
    },
    notes: [{ ingredients: ['Spearmint'], type: EScentNoteType.TOP, image: '' }],
  },
];

export class ScentConfigSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const scentConfigRepository = dataSource.getRepository(ScentConfig);

    for (const record of records) {
      const entity = scentConfigRepository.create(record);
      await scentConfigRepository.save(entity);
    }
  }
}
