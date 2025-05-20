import { Injectable } from '@nestjs/common';
import { UserRepository } from 'common/repositories/user.repository';
import { BaseService } from 'core/services/base.service';
import { CreateUserDto, UpdateUserDto, UserGetListQueries } from 'modules/user/dto/user.request';
import { FindOptionsWhere } from 'typeorm';

import { MESSAGE } from '../../../common/constants/message.constant';
import { generateRandomPassword } from '../../../common/utils/helper';
import { logger } from '../../../core/logger/index.logger';
import { CognitoService } from '../../auth/cognito.service';
import { UserDto } from '../dto/user.dto';
import { User, UserRole, UserStatus, UserType } from '../entities/user.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    private readonly repo: UserRepository,
    private readonly cognitoService: CognitoService,
  ) {
    super(repo);
  }

  async isExistUser(email: string) {
    return this.exists({
      where: { email },
    });
  }

  async getListUser(queries: UserGetListQueries, isAdmin = true) {
    return this.findAll(
      {
        ...(isAdmin ? queries : { ...queries, role: UserRole.MEMBER }),
      },
      {},
      ['name', 'email'],
    );
  }

  async getUserDetail(user_id: string, isAdmin = true) {
    const where: FindOptionsWhere<User> = { user_id };

    if (!isAdmin) {
      where.role = UserRole.MEMBER;
    }

    return this.findOne({
      where,
    });
  }

  async getUserDetailByEmail(email: string, isAdmin = true) {
    const where: FindOptionsWhere<User> = { email };

    if (!isAdmin) {
      where.role = UserRole.MEMBER;
    }

    return this.findOne({
      where,
    });
  }

  async getUserDetailBy(where: FindOptionsWhere<User>, isAdmin = true) {
    return this.findOne({
      ...(isAdmin ? { where } : { where: { ...where, role: UserRole.MEMBER } }),
    });
  }

  async getAllUsers(query: UserGetListQueries) {
    try {
      switch (query.type) {
        case UserType.CMS:
          return this.getAllCmsUsers(query);

        case UserType.APP:
          return this.getAllAppUsers(query);

        default:
          throw new Error(`Unsupported user type: ${query.type}`);
      }
    } catch (error) {
      logger.error('Failed to retrieve users:', error);
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  /**
   * Get CMS users from Cognito
   */
  private async getAllCmsUsers(query: UserGetListQueries) {
    const { page = 1, perPage = 10, search, paginationToken } = query;

    // Prepare filter based on search parameter
    let filter;
    if (search) {
      // Filter by email or name that starts with the search term
      filter = `email ^= "${search}" or name ^= "${search}"`;
    }

    // Get users from Cognito with pagination
    const usersResult = await this.cognitoService.listUsers({
      limit: perPage ? Number(perPage) : undefined,
      filter,
      paginationToken,
    });

    if (!usersResult || !usersResult.users) {
      throw new Error(MESSAGE.SYSTEM.ERROR);
    }

    // Format response
    const users = usersResult.users.map((user) => ({
      id: user.attributes.sub,
      name: user.attributes.name || '',
      givenName: user.attributes.given_name || '',
      email: user.attributes.email || '',
      role: user.attributes['custom:role'] || '',
      emailVerified: user.attributes.email_verified === 'true',
      enabled: user.enabled,
      status: user.userStatus,
      createdAt: user.userCreateDate,
      updatedAt: user.userLastModifiedDate,
    }));

    // Return formatted data with pagination metadata
    return {
      items: users,
      pagination: {
        page: Number(page),
        perPage: Number(perPage),
        paginationToken: usersResult.paginationToken,
        total: users.length,
      },
    };
  }

  /**
   * Get APP users from database
   */
  private async getAllAppUsers(query: UserGetListQueries) {
    return await this.findAll(
      {
        ...query,
        type: UserType.APP,
      },
      {},
      ['name', 'email'],
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /**
   * Get user details by ID
   * @param user_id - The user's ID
   * @returns User details
   */
  async getUserById(user_id: string): Promise<any> {
    try {
      // Fetch user details from Cognito
      const cognitoUser = await this.cognitoService.getCMSUserByUserId(user_id);

      if (!cognitoUser) {
        throw new Error('User not found');
      }

      // Return user details
      return cognitoUser;
    } catch (error) {
      logger.error('Failed to fetch user by ID:', error);
      throw error;
    }
  }

  /**
   * Update CMS user by email
   * @param email - The user's email address
   * @param userData - Data to update the user with
   * @returns Updated user details
   */
  async updateCmsUserByEmail(email: string, userData: UpdateUserDto): Promise<any> {
    try {
      // Get existing user
      const existingUser = await this.getUserDetailByEmail(email);

      if (!existingUser) {
        throw new Error('User not found');
      }

      if (existingUser.type !== UserType.CMS) {
        throw new Error('Only CMS users can be updated through this endpoint');
      }

      // Update user in Cognito first
      const updateResult = await this.cognitoService.updateUser({
        email: email,
        firstName: userData.name || existingUser.name,
        lastName: userData.givenName || existingUser.givenName,
        role: userData.role || existingUser.role,
      });

      if (!updateResult) {
        throw new Error('Failed to update user in Cognito');
      }

      // Get updated user from Cognito
      const updatedCognitoUser = await this.cognitoService.getUserByEmail(email);

      // Sync changes to our database
      const updatedUser = await this.syncUserWithCognitoData({
        ...updatedCognitoUser,
        type: UserType.CMS,
      });

      // Return formatted response without profile data
      return {
        id: updatedUser.user_id,
        email: updatedUser.email,
        name: updatedUser.name,
        givenName: updatedUser.givenName,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        isAdmin: updatedUser.isAdmin,
        emailVerified: updatedUser.emailVerified,
        enabled: updatedUser.enabled,
        type: updatedUser.type,
      };
    } catch (error) {
      logger.error('Failed to update CMS user by email:', error);
      throw error;
    }
  }

  /**
   * Update CMS user by id
   * @param user_id - The user's id
   * @param userData - Data to update the user with
   * @returns Updated user details
   */
  async updateCmsUserById(user_id: string, userData: UpdateUserDto): Promise<boolean> {
    try {
      // 1. Get user from Cognito first using user_id
      const cognitoUser = await this.cognitoService.getCMSUserByUserId(user_id);
      if (!cognitoUser) {
        throw new Error('User not found');
      }

      // Update in Cognito
      const updateResult = await this.cognitoService.updateUser({
        email: cognitoUser.email,
        firstName: userData.name || '',
        lastName: userData.givenName || '',
        role: userData.role || UserRole.MEMBER,
        enabled: userData.enabled,
      });

      if (!updateResult) {
        throw new Error('Failed to update user');
      }

      // 3. Get updated user data from Cognito
      const updatedCognitoUser = await this.cognitoService.getUserByEmail(cognitoUser.email);
      if (!updatedCognitoUser) {
        throw new Error('Failed to get updated user from Cognito');
      }

      // 4. Check if user exists in our database
      const existingUser = await this.repository.findOne({ where: { user_id } });

      if (!existingUser) {
        // Create new user in database from Cognito data
        await this.syncUserWithCognitoData({ ...updatedCognitoUser, type: UserType.CMS });
      } else {
        // Update existing user with Cognito data and additional fields
        const userDataForDb: Partial<User> = {
          email: updatedCognitoUser.email,
          name: updatedCognitoUser.name || existingUser.name,
          givenName: updatedCognitoUser.given_name || existingUser.givenName,
          role: (updatedCognitoUser['custom:role'] as UserRole) || existingUser.role,
          type: UserType.CMS,
          enabled: updatedCognitoUser.enabled,
        };

        if (userData.isAdmin !== undefined) {
          userDataForDb.isAdmin = userData.isAdmin;
        } else if (userData.role) {
          userDataForDb.isAdmin = userData.role === UserRole.ADMIN;
        }

        await this.repository.update({ user_id }, userDataForDb);
      }

      return true;
    } catch (error) {
      logger.error('Failed to update CMS user by id:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserDto): Promise<boolean> {
    try {
      // 1. Create user in Cognito first
      const cognitoUserResponse = await this.cognitoService.createUser({
        email: userData.email,
        password: generateRandomPassword(),
        firstName: userData.name,
        lastName: userData.givenName,
        role: userData.role || UserRole.MEMBER,
      });

      // Extract user sub (user_id) from the response
      let userId: string | undefined;

      if (cognitoUserResponse.User?.Attributes) {
        const subAttribute = cognitoUserResponse.User.Attributes.find(
          (attr) => attr.Name === 'sub',
        );
        userId = subAttribute?.Value;
      }

      if (!userId) {
        // If we can't get the sub from the response, try to get the user details
        const cognitoUser = await this.cognitoService.getUserByEmail(userData.email);
        userId = cognitoUser.sub;
      }

      if (!userId) {
        throw new Error('Failed to get user ID from Cognito');
      }

      // 2. Then sync to our database
      const userDataForDb: Partial<User> = {
        user_id: userId,
        email: userData.email,
        name: userData.name,
        givenName: userData.givenName,
        status: UserStatus.UNCONFIRMED,
        role: userData.role || UserRole.MEMBER,
        isAdmin: userData.isAdmin || userData.role === UserRole.ADMIN,
        enabled: userData.enabled,
        type: UserType.CMS,
      };

      // Create user in our database
      const newUser = this.repository.create(userDataForDb);
      await this.repository.save(newUser);

      return true;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Updates a user's information in both Cognito and local database
   * @param user_id - The ID of the user to update
   * @param userData - The data to update the user with
   * @returns The updated user object
   */
  async updateUser(user_id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const hasCognitoUpdates = this.hasCognitoUpdates(userData);

      if (hasCognitoUpdates) {
        await this.handleCognitoUpdates(user_id, userData);
      } else {
        await this.handleDatabaseOnlyUpdates(user_id, userData);
      }

      return this.getUpdatedUser(user_id);
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Checks if the update contains any Cognito-related fields
   */
  private hasCognitoUpdates(userData: UpdateUserDto): boolean {
    return !!(userData.email || userData.name || userData.givenName || userData.role);
  }

  /**
   * Handles updates that require Cognito synchronization
   */
  private async handleCognitoUpdates(user_id: string, userData: UpdateUserDto): Promise<void> {
    const email = await this.getUserEmailForUpdate(user_id, userData);
    const cognitoUser = await this.updateCognitoUser(email, userData);
    await this.syncUserWithDatabase(user_id, cognitoUser, userData);
  }

  /**
   * Gets the email to use for Cognito updates
   */
  private async getUserEmailForUpdate(user_id: string, userData: UpdateUserDto): Promise<string> {
    if (userData.email) {
      return userData.email;
    }

    const cognitoUser = await this.cognitoService.getCMSUserByUserId(user_id);
    if (!cognitoUser) {
      throw new Error('User not found in Cognito');
    }

    return cognitoUser.email;
  }

  /**
   * Updates user information in Cognito
   */
  private async updateCognitoUser(email: string, userData: UpdateUserDto): Promise<any> {
    await this.cognitoService.updateUser({
      email,
      firstName: userData.name || '',
      lastName: userData.givenName || '',
      role: userData.role || UserRole.MEMBER,
    });

    const updatedCognitoUser = await this.cognitoService.getUserByEmail(email);
    if (!updatedCognitoUser) {
      throw new Error('Failed to get updated user from Cognito');
    }

    return updatedCognitoUser;
  }

  /**
   * Syncs Cognito user data with the database
   */
  private async syncUserWithDatabase(
    user_id: string,
    cognitoUser: any,
    userData: UpdateUserDto,
  ): Promise<void> {
    const existingUser = await this.repository.findOne({ where: { user_id } });

    if (!existingUser) {
      await this.syncUserWithCognitoData(cognitoUser);

      return;
    }

    const userDataForDb = this.prepareUserDataForDb(cognitoUser, existingUser, userData);
    await this.repository.update({ user_id }, userDataForDb);
  }

  /**
   * Prepares user data for database update
   */
  private prepareUserDataForDb(
    cognitoUser: any,
    existingUser: User,
    userData: UpdateUserDto,
  ): Partial<User> {
    const userDataForDb: Partial<User> = {
      email: cognitoUser.email,
      name: cognitoUser.name || existingUser.name,
      givenName: cognitoUser.given_name || existingUser.givenName,
      role: (cognitoUser['custom:role'] as UserRole) || existingUser.role,
    };

    this.updateAdminStatus(userDataForDb, userData);

    return userDataForDb;
  }

  /**
   * Updates the admin status based on user data
   */
  private updateAdminStatus(userDataForDb: Partial<User>, userData: UpdateUserDto): void {
    if (userData.isAdmin !== undefined) {
      userDataForDb.isAdmin = userData.isAdmin;
    } else if (userData.role) {
      userDataForDb.isAdmin = userData.role === UserRole.ADMIN;
    }
  }

  /**
   * Handles updates that only affect the database
   */
  private async handleDatabaseOnlyUpdates(user_id: string, userData: UpdateUserDto): Promise<void> {
    const existingUser = await this.repository.findOne({ where: { user_id } });
    if (!existingUser) {
      return;
    }

    const userDataForDb: Partial<User> = {};
    if (userData.isAdmin !== undefined) {
      userDataForDb.isAdmin = userData.isAdmin;
    }

    if (Object.keys(userDataForDb).length > 0) {
      await this.repository.update({ user_id }, userDataForDb);
    }
  }

  /**
   * Retrieves the updated user from the database
   */
  private async getUpdatedUser(user_id: string): Promise<User> {
    const updatedUser = await this.repository.findOne({ where: { user_id } });
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  async syncUserWithCognitoData(cognitoUser: {
    email: string;
    sub: string;
    type: UserType;
    name?: string;
    given_name?: string;
    status?: string;
    role?: UserRole;
    email_verified?: boolean | string;
    enabled?: boolean;
    phone_number_verified?: boolean | string;
  }): Promise<User> {
    try {
      const existingUser = await this.findUserByEmail(cognitoUser.email);

      // Extract role from either role or custom:role

      // Prepare user data for database
      const userDataForDb: Partial<User> = {
        email: cognitoUser.email,
        name: cognitoUser.name || '',
        givenName: cognitoUser.given_name || '',
        status: (cognitoUser.status as UserStatus) || UserStatus.UNCONFIRMED,
        role: cognitoUser.role,
        emailVerified:
          typeof cognitoUser.email_verified === 'string'
            ? cognitoUser.email_verified === 'true'
            : !!cognitoUser.email_verified,
        enabled: cognitoUser.enabled !== undefined ? cognitoUser.enabled : false,
        phoneNumberVerified:
          typeof cognitoUser.phone_number_verified === 'string'
            ? cognitoUser.phone_number_verified === 'true'
            : !!cognitoUser.phone_number_verified,
        isAdmin: cognitoUser.role === UserRole.ADMIN,
        type: cognitoUser.type,
      };

      // Add user_id if available
      if (cognitoUser.sub) {
        userDataForDb.user_id = cognitoUser.sub;
      }

      if (existingUser) {
        // Update existing user
        await this.repository.update({ user_id: existingUser.user_id }, userDataForDb);

        return this.repository.findOne({ where: { user_id: existingUser.user_id } });
      } else {
        // Create new user - we need to ensure required fields are present
        if (!userDataForDb.user_id) {
          throw new Error('Cannot create user without a user_id (sub)');
        }

        // Create user with required fields
        const newUser = this.repository.create({
          ...userDataForDb,
          // Ensure we have defaults for required fields
          status: userDataForDb.status || UserStatus.UNCONFIRMED,
          role: userDataForDb.role || UserRole.MEMBER,
        });

        return this.repository.save(newUser);
      }
    } catch (error) {
      logger.error('Failed to sync user with Cognito data:', error);
      throw new Error(`Failed to sync user with Cognito: ${error.message}`);
    }
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.email) {
      throw new Error('User email not found');
    }

    await this.cognitoService.deleteUser(user.email);

    await this.delete(userId);

    return true;
  }

  async getMobileProfile(user: UserDto) {
    const cognitoUser = await this.cognitoService.getMobileUserByUserId(user.sub);

    if (!cognitoUser) {
      throw new Error('User not found');
    }

    return await this.syncUserWithCognitoData({
      email: cognitoUser.email,
      name: cognitoUser.name,
      given_name: cognitoUser.givenName,
      status: cognitoUser.status,
      role: cognitoUser.role,
      sub: cognitoUser.id,
      email_verified: cognitoUser.emailVerified,
      enabled: cognitoUser.enabled,
      phone_number_verified: cognitoUser.phoneNumberVerified,
      type: UserType.APP,
    });
  }

  async blockUserById(userId: string) {
    const cognitoUser = await this.cognitoService.getMobileUserByUserId(userId);

    if (!cognitoUser) {
      throw new Error('User not found');
    }

    const enabled = await this.cognitoService.enableUser(
      cognitoUser.email,
      !cognitoUser.enabled,
      false,
    );

    await this.syncUserWithCognitoData({
      email: cognitoUser.email,
      name: cognitoUser.name,
      given_name: cognitoUser.givenName,
      status: cognitoUser.status,
      role: cognitoUser.role,
      sub: cognitoUser.id,
      email_verified: cognitoUser.emailVerified,
      phone_number_verified: cognitoUser.phoneNumberVerified,
      enabled,
      type: UserType.APP,
    });

    return true;
  }
}
