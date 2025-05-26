import { DataSource } from 'typeorm';

import {
  EScentNoteType,
  ScentConfig,
} from '../../modules/scent-config/entities/scent-config.entity';
import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../../modules/system/entities/setting-definition.entity';
import { BaseSeeder } from './base.seeder';

// Helper function to get random elements from array
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count);
}

const records = [
  {
    code: 'S01',
    name: 'solemm',
    title: 'stillness of shadows',
    background: 'scent-S01.png',
    tags: [],
    description:
      'A solemn blend of floral, citrus, and woody notes that creates a meditative atmosphere. Stillness of Shadows opens with bright citrus accents before revealing delicate floral heart notes and settling into a grounding woody base that evokes the quiet contemplation of dappled shadows.',
    story: {
      content:
        "Inspired by the serene moment when sunlight filters through leaves, creating a dance of light and shadow. This fragrance captures the ephemeral beauty of stillness and the depth found in quiet moments. The interplay of brightness and depth mirrors the natural world's ability to create spaces of profound calm and reflection.",
      image: 'story.png',
    },
    notes: [
      {
        ingredients: ['Lavender', 'Bergamot', 'Lemon'],
        type: EScentNoteType.TOP,
        image: 'note-1.png',
      },
      {
        ingredients: ['Sage', 'Rosemary', 'Thyme'],
        type: EScentNoteType.MIDDLE,
        image: 'note-2.png',
      },
      {
        ingredients: ['Cedar', 'Oakmoss', 'Sandalwood'],
        type: EScentNoteType.BASE,
        image: 'note-3.png',
      },
    ],
    color: {
      base: '#8796a7',
      gradients: ['#8796a7', '#b0ccf5'],
    },
  },
  {
    code: 'R01',
    name: 'Petal Symphony',
    title: 'White Floral Elegance',
    background: 'scent-I01.png',
    tags: [],
    description:
      'An exquisite bouquet celebrating the most precious white flowers in perfumery. Petal Symphony opens with bright citrus notes that give way to an opulent heart of jasmine, rose, and lily of the valley. The composition settles into a creamy base of vanilla and amber, creating a scent that embodies timeless feminine elegance.',
    story: {
      content:
        "Petal Symphony was born from a master perfumer's journey through the legendary flower fields of Grasse, France. Each note captures a moment at dawn when the most precious white flowers release their most intense fragrance. The delicate balance between the freshness of morning dew, the richness of full blooms, and the warmth of amber creates a multi-dimensional fragrance that unfolds like a beautiful melody throughout the day, revealing new facets with each passing hour.",
      image: 'story.png',
    },
    notes: [
      {
        ingredients: ['Bergamot', 'Pink Pepper', 'Mandarin'],
        type: EScentNoteType.TOP,
        image: 'note-1.png',
      },
      {
        ingredients: ['Rose', 'Jasmine', 'Lily of the Valley'],
        type: EScentNoteType.MIDDLE,
        image: 'note-2.png',
      },
      {
        ingredients: ['Vanilla', 'Amber', 'White Musk'],
        type: EScentNoteType.BASE,
        image: 'note-3.png',
      },
    ],
    color: {
      base: '#d7eba0',
      gradients: ['#d7eba0', '#7ff570'],
    },
  },
  {
    code: 'I01',
    name: 'The Intimate Series',
    title: 'ivory interlude',
    background: 'scent-I01.png',
    tags: [],
    description:
      'An intimate composition that blends aldehydic brightness with warm ambery notes and sophisticated woody accents. Ivory Interlude creates a personal sanctuary of elegance and warmth, with a complexity that unfolds gracefully over time.',
    story: {
      content:
        "Part of The Intimate Series, Ivory Interlude explores the delicate space between public presence and private reflection. This composition draws inspiration from those rare, precious moments of pause in our daily rhythms – an interlude of calm and reflection amid life's constant motion. The sophisticated balance of brightness and depth creates a scent that feels both luxurious and deeply personal.",
      image: 'story.png',
    },
    notes: [
      {
        ingredients: ['Aldehydes', 'Bergamot', 'Pink Pepper'],
        type: EScentNoteType.TOP,
        image: 'note-1.png',
      },
      {
        ingredients: ['Iris', 'Heliotrope', 'Orris'],
        type: EScentNoteType.MIDDLE,
        image: 'note-2.png',
      },
      {
        ingredients: ['Amber', 'Sandalwood', 'Vanilla'],
        type: EScentNoteType.BASE,
        image: 'note-3.png',
      },
    ],
    color: {
      base: '#fd99e6',
      gradients: ['#fd99e6', '#ef6451'],
    },
  },
  {
    code: 'H01',
    name: 'Orchard Mist',
    title: 'Fresh Fruity Elegance',
    background: 'scent-S01.png',
    tags: [],
    description:
      'A modern, sophisticated fragrance that balances juicy fruit notes with clean greens and subtle musk. Orchard Mist opens with vibrant fruit notes that feel dewy and fresh rather than sweet, transitioning to a heart of delicate white flowers that add refinement and complexity. The composition settles into a sophisticated base of clean musk that gives it a contemporary signature.',
    story: {
      content:
        "Orchard Mist was inspired by early autumn mornings in a heritage orchard, where ripe fruits hang heavy on ancient trees, surrounded by wildflowers and bathed in gentle morning fog. This unique microclimate creates a sensory experience where the sweetness of fruit is tempered by the surrounding vegetation and cool, damp air. The fragrance captures this perfect balance between nature's abundance and restraint - neither too sweet nor too green, but a harmonious composition that evokes memories of harvest time and the transition between seasons.",
      image: 'story.png',
    },
    notes: [
      {
        ingredients: ['Green Apple', 'Pear', 'Peach'],
        type: EScentNoteType.TOP,
        image: 'note-1.png',
      },
      {
        ingredients: ['Jasmine', 'Violet', 'Lily'],
        type: EScentNoteType.MIDDLE,
        image: 'note-2.png',
      },
      {
        ingredients: ['Musk', 'Ambergris', 'Woody Notes'],
        type: EScentNoteType.BASE,
        image: 'note-3.png',
      },
    ],
    color: {
      base: '#ffe54e',
      gradients: ['#ffe54e', '#ffb731'],
    },
  },
  {
    code: 'F01',
    name: 'Spice Route',
    title: 'Exotic Woody Warmth',
    background: 'scent-S01.png',
    tags: [],
    description:
      'A rich and complex fragrance that brings to life the ancient spice routes with warm spices, precious woods, and bright citrus accents. Spice Route opens with vibrant orange and spice notes that immediately transport you to exotic markets, while the heart reveals sophisticated woody facets enhanced by subtle floral touches. The base anchors the composition with deep, earthy notes that evoke rare woods and resins.',
    story: {
      content:
        'Spice Route celebrates the historic trade paths that connected East and West, where precious spices, exotic woods, and rare resins were transported across continents. Inspired by the treasure-laden caravans that traveled through ancient cities, this fragrance captures the sensory richness of these journeys - the warm spices that were worth their weight in gold, the precious woods used in temples and palaces, and the bright citrus fruits that refreshed weary travelers. Each note tells a story of cultural exchange and the human quest for sensory delight across centuries.',
      image: 'story.png',
    },
    notes: [
      {
        ingredients: ['Cinnamon', 'Orange', 'Clove', 'Cardamom'],
        type: EScentNoteType.TOP,
        image: 'note-1.png',
      },
      {
        ingredients: ['Cedarwood', 'Rose', 'Nutmeg'],
        type: EScentNoteType.MIDDLE,
        image: 'note-2.png',
      },
      {
        ingredients: ['Sandalwood', 'Patchouli', 'Vetiver'],
        type: EScentNoteType.BASE,
        image: 'note-3.png',
      },
    ],
    color: {
      base: '#c6daff',
      gradients: ['#c6daff', '#7f4a9b'],
    },
  },
  {
    code: 'E01',
    name: 'Mint Meditation',
    title: 'Serene Green Retreat',
    background: 'scent-I01.png',
    tags: [],
    description:
      'A calming yet refreshing blend that combines the clarity of mint with soothing green tea notes. Mint Meditation opens with a crisp array of mint varieties that feel both energizing and centering, evolving into a serene heart of tea and herbal notes. The composition is grounded in a smooth base of amber and musk that adds warmth and longevity without disturbing its meditative quality.',
    story: {
      content:
        'Mint Meditation was inspired by the ancient practice of Japanese tea ceremonies, where each element is carefully chosen to create a moment of perfect harmony and presence. The fragrance combines the awakening quality of mint with the contemplative nature of tea to create a scent experience that both energizes and centers the mind. Like a moment of mindfulness captured in a bottle, it reminds us of the rejuvenating power of taking time to breathe deeply and connect with the present moment, finding balance between stimulation and calm.',
      image: 'story.png',
    },
    notes: [
      {
        ingredients: ['Spearmint', 'Peppermint', 'Lemon Balm'],
        type: EScentNoteType.TOP,
        image: 'note-1.png',
      },
      {
        ingredients: ['Tea Leaf', 'Green Tea', 'Herbal Notes'],
        type: EScentNoteType.MIDDLE,
        image: 'note-2.png',
      },
      {
        ingredients: ['Amber', 'Musk', 'Tonka Bean'],
        type: EScentNoteType.BASE,
        image: 'note-3.png',
      },
    ],
    color: {
      base: '#e2683b',
      gradients: ['#e2683b', '#bffab7'],
    },
  },
];

export class ScentConfigSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const scentConfigRepository = dataSource.getRepository(ScentConfig);
    const settingDefinitionRepo = dataSource.getRepository(SettingDefinition);

    // Fetch all scent tags
    const scentTags = await settingDefinitionRepo.find({
      where: {
        type: ESystemDefinitionType.SCENT_TAG,
      },
    });

    // Get array of tag IDs
    const tagIds = scentTags.map((tag) => tag.id);

    // Update records with random tag IDs (1-3 tags per scent)
    const updatedRecords = records.map((record) => {
      const numTags = Math.floor(Math.random() * 3) + 1; // Random number between 1-3
      const randomTagIds = getRandomElements(tagIds, numTags);

      return {
        ...record,
        tags: randomTagIds,
      };
    });

    const existingRecords = await scentConfigRepository.find({
      where: updatedRecords.map((record) => ({ code: record.code })),
    });

    // Process records in a single loop
    for (const record of updatedRecords) {
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
