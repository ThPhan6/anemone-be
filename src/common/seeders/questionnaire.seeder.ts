import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../../modules/setting-definition/entities/setting-definition.entity';
import { SettingValue } from '../../modules/setting-definition/entities/setting-value.entity';
import { BaseSeeder } from './base.seeder';

const records = [
  {
    name: 'What kind of moments do you want to enhance with scents?',
    metadata: {
      image: 'Mask Group 522.png',
      index: 0,
      max: null,
    },
    answers: [
      {
        value: 'Relaxation',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Daily Rituals',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Self-care',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Getting ready',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Focus',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Small joys',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Sleep',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Intimacy',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Social gatherings',
        metadata: {
          type: 'tag',
        },
      },
    ],
  },
  {
    name: 'Which of these activities best matches your daily routine? ',
    metadata: {
      max: 2,
      image: 'Mask Group 27.png',
      index: 1,
    },
    answers: [
      {
        value: 'working from home or office',
        metadata: {
          image: 'Mask Group 32.png',
          type: 'image-card',
        },
      },
      {
        value: 'working out',
        metadata: {
          image: 'Mask Group 41.png',
          type: 'image-card',
        },
      },
      {
        value: 'meditating',
        metadata: {
          image: 'Mask Group 43.png',
          type: 'image-card',
        },
      },
    ],
  },
  {
    name: 'How would you describe your preferred scent profiles?',
    metadata: {
      max: null,
      image: 'Mask Group 519.png',
      index: 3,
    },
    answers: [
      {
        value: 'Fresh & Clean',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Woody & Earthy',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Spicy & Warm',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Floral & Delicate',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'Fruity & Sweet',
        metadata: {
          type: 'tag',
        },
      },
    ],
  },
  {
    name: 'Which of the following moods would you like to evoke through scents?',
    metadata: {
      max: 3,
      image: 'Mask Group 520.png',
      index: 4,
    },
    answers: [
      {
        value: 'calm & relaxed',
        metadata: {
          image: 'Mask Group 41.png',
          type: 'image-card',
        },
      },
      {
        value: 'energized & focused',
        metadata: {
          image: 'Mask Group 44.png',
          type: 'image-card',
        },
      },
      {
        value: 'adventurous & curious',
        metadata: {
          image: 'Mask Group 45.png',
          type: 'image-card',
        },
      },
    ],
  },
  {
    name: 'How sensitive are you to scents?',
    metadata: {
      max: 1,
      image: 'Mask Group 521.png',
      index: 5,
    },
    answers: [
      {
        value: 'I prefer subtle, light scents',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'I like well-balanced scents',
        metadata: {
          type: 'tag',
        },
      },
      {
        value: 'I love strong, bold scents',
        metadata: {
          type: 'tag',
        },
      },
    ],
  },
];

export class QuestionnaireSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<any> {
    const data = records.map((el) => {
      const questionId = uuid();

      return {
        ...el,
        id: questionId,
        answers: el.answers?.map((answer) => ({
          ...answer,
          id: uuid(),
          questionId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    });

    const questions = data.map((el) => ({
      id: el.id,
      type: ESystemDefinitionType.QUESTIONNAIRE,
      metadata: el.metadata,
      name: el.name,
    }));

    const answers = data.flatMap((el) => el.answers);

    /// create questions
    const questionRepository = dataSource.getRepository(SettingDefinition);
    const questionEntities = questionRepository.create(questions);
    await questionRepository.save(questionEntities);

    /// create answers
    const answerRepository = dataSource.getRepository(SettingValue);
    const answerEntities = answers.map((answer) => {
      const entity = new SettingValue();
      entity.id = answer.id;
      entity.value = answer.value;
      entity.metadata = answer.metadata;
      entity.createdAt = answer.createdAt;
      entity.updatedAt = answer.updatedAt;
      entity.deletedAt = answer.deletedAt;

      // Set the relationship correctly
      entity.settingDefinition = { id: answer.questionId } as SettingDefinition;

      return entity;
    });

    await answerRepository.save(answerEntities);
  }
}
