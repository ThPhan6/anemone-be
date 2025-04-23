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
    background: 'scent-1.png',
    tags: ['AROMATIC', 'HERBAL', 'WOODY'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: 'scent-1.png',
    },
    notes: [{ ingredients: ['Lavender'], type: EScentNoteType.TOP, image: 'scent-1.png' }],
    color: {
      base: '#C5D1B9',
      gradients: ['#C5D1B9', '#E8A87C'],
    },
  },
  {
    code: 'R01',
    name: 'Scent 2',
    title: 'Scent 2 Title',
    background: 'scent-2.png',
    tags: ['FLORAL', 'WHITE', 'FLORAL'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: 'scent-2.png',
    },
    notes: [{ ingredients: ['Rose'], type: EScentNoteType.MIDDLE, image: 'scent-2.png' }],
    color: {
      base: '#B5D1FF',
      gradients: ['#B5D1FF', '#F5B0FF'],
    },
  },
  {
    code: 'I01',
    name: 'Scent 3',
    title: 'Scent 3 Title',
    background: 'scent-3.png',
    tags: ['GREEN', 'MINT'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: 'scent-3.png',
    },
    notes: [{ ingredients: ['Mint'], type: EScentNoteType.TOP, image: 'scent-3.png' }],
    color: {
      base: '#C2D1D1',
      gradients: ['#C2D1D1', '#E8DEB0'],
    },
  },
  {
    code: 'H01',
    name: 'Scent 4',
    title: 'Scent 4 Title',
    background: 'scent-4.png',
    tags: ['GREEN', 'FRUITY', 'MUSKY'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: 'scent-4.png',
    },
    notes: [
      { ingredients: ['Green Apple'], type: EScentNoteType.TOP, image: 'scent-3.png' },
      { ingredients: ['Musk'], type: EScentNoteType.BASE, image: 'scent-1.png' },
    ],
    color: {
      base: '#FFFFFF',
      gradients: ['#FFFFFF', '#FFD966'],
    },
  },
  {
    code: 'F01',
    name: 'Scent 5',
    title: 'Scent 5 Title',
    background: 'scent-5.png',
    tags: ['SPICY', 'WOODY', 'CITRUS'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: 'scent-5.png',
    },
    notes: [
      { ingredients: ['Cinnamon'], type: EScentNoteType.TOP, image: 'scent-1.png' },
      { ingredients: ['Cedarwood'], type: EScentNoteType.MIDDLE, image: 'scent-2.png' },
      { ingredients: ['Orange'], type: EScentNoteType.TOP, image: 'scent-3.png' },
    ],
    color: {
      base: '#B5C7FF',
      gradients: ['#B5C7FF', '#9B6B9E'],
    },
  },
  {
    code: 'E01',
    name: 'Scent 6',
    title: 'Scent 6 Title',
    background: 'scent-6.png',
    tags: ['GREEN', 'MINT'],
    description:
      "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
    story: {
      content:
        "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries",
      image: 'scent-6.png',
    },
    notes: [{ ingredients: ['Spearmint'], type: EScentNoteType.TOP, image: 'scent-3.png' }],
    color: {
      base: '#C5E0B4',
      gradients: ['#C5E0B4', '#E6B8A1'],
    },
  },
];

export class ScentConfigSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const scentConfigRepository = dataSource.getRepository(ScentConfig);

    const existingRecords = await scentConfigRepository.find({
      where: records.map((record) => ({ code: record.code })),
    });

    // Process records in a single loop
    for (const record of records) {
      const existingRecord = existingRecords.find((r) => r.code === record.code);

      if (existingRecord) {
        await scentConfigRepository.update(existingRecord.id, record);
      } else {
        const entity = scentConfigRepository.create(record);
        await scentConfigRepository.save(entity);
      }
    }
  }
}
