import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { User } from 'common/entities/user.entity';
import { UserProfile } from 'common/entities/user-profile.entity';
import { UserRole } from 'common/enums/user.enum';
import { logger } from 'core/logger/index.logger';
import { DataSource } from 'typeorm';

import { BaseSeeder } from './base.seeder';

export class UserSeeder extends BaseSeeder {
  protected async execute(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User);
    const profileRepo = dataSource.getRepository(UserProfile);

    const userData = [
      {
        email: 'admin@tangent.com',
        role: UserRole.ADMIN,
        isActive: true,
        password: 'Tan.gent@123!',
        name: 'Admin',
      },
      {
        email: 'staff@tangent.com',
        role: UserRole.STAFF,
        isActive: true,
        password: 'Tan.gent@123!',
        name: 'Staff',
      },
      {
        email: 'member@tangent.com',
        role: UserRole.MEMBER,
        isActive: true,
        password: 'Tan.gent@123!',
        name: 'Member',
      },
    ];

    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    // Check if users already exist to prevent duplicates
    for (const user of userData) {
      const params: AdminCreateUserCommandInput = {
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        Username: user.email,
        UserAttributes: [
          { Name: 'email', Value: user.email },
          { Name: 'name', Value: user.name },
          { Name: 'custom:role', Value: user.role },
        ],
        TemporaryPassword: user.password,
      };

      const command = new AdminCreateUserCommand(params);

      const result = await client.send(command);
      if (!result.User) {
        logger.error(`Create user failed: ${user.email}`);
        continue;
      }

      const existingUser = await repository.findOne({
        where: { email: user.email },
      });

      if (!existingUser) {
        const newUser = repository.create({
          ...user,
          cogId: result.User.Attributes.find((x) => x.Name === 'sub')?.Value,
        });
        await repository.save(newUser);

        const profile = profileRepo.create({
          user: newUser,
          name: user.name,
        });

        await profileRepo.save(profile);
      }
    }
  }
}
