import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Scent } from '../../common/entities/scent.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { paginate } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { CognitoService } from '../auth/cognito.service';
import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../setting-definition/entities/setting-definition.entity';
import { StorageService } from '../storage/storage.service';
import { CreateScentMobileDto, UpdateScentMobileDto } from './dto/scent-mobile-request.dto';
@Injectable()
export class ScentMobileService {
  constructor(
    @InjectRepository(Scent)
    private readonly scentRepository: Repository<Scent>,
    private storageService: StorageService,
    @InjectRepository(SettingDefinition)
    private readonly settingDefinitionRepository: Repository<SettingDefinition>,
    @InjectRepository(UserSetting)
    private readonly userSettingRepository: Repository<UserSetting>,
    private readonly cognitoService: CognitoService,
  ) {}

  async get(userId: string, queries: ApiBaseGetListQueries): Promise<Pagination<Scent>> {
    const { search } = queries;

    const whereConditions: any = {
      createdBy: userId,
    };
    if (search) {
      whereConditions.name = ILike(`%${search}%`); // ILike for case-insensitive search
    }

    const userInfo = await this.cognitoService.getUserByUserId(userId);

    const result = await paginate(this.scentRepository, {
      where: whereConditions,
      params: queries,
    });

    return {
      items: result.items.map((el) => ({
        ...el,
        image: el.image ? convertURLToS3Readable(el.image) : '',
        createdBy: userInfo,
      })),
      pagination: result.pagination,
    };
  }

  async getById(scentId: string) {
    const scent = await this.scentRepository.findOne({ where: { id: scentId } });

    if (!scent) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Fetch the categories where type = ScentTag
    const categories = await this.settingDefinitionRepository.find({
      where: { type: ESystemDefinitionType.SCENT_TAG },
    });

    // Assuming `tags` in the Scent are category IDs, fetch the corresponding category names
    const categoryTags = categories
      .filter((category) => JSON.parse(scent.tags).includes(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
      }));

    return {
      ...scent,
      image: scent.image ? convertURLToS3Readable(scent.image) : '',
      tags: categoryTags,
    };
  }

  async create(userId: string, bodyRequest: CreateScentMobileDto, file: Express.Multer.File) {
    const found = await this.scentRepository.findOne({
      where: {
        name: bodyRequest.name,
        createdBy: userId,
      },
    });

    if (found) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    let uploadedImageUrl = '';

    if (file) {
      const fileName = `scents/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      uploadedImageUrl = uploadedImage.origin;
    }

    const scent = this.scentRepository.create({
      ...bodyRequest,
      image: uploadedImageUrl,
      createdBy: userId,
    });

    return await this.scentRepository.save(scent);
  }

  async update(
    userId: string,
    scentId: string,
    updateScentDto: UpdateScentMobileDto,
    file: Express.Multer.File,
  ) {
    const found = await this.scentRepository.findOne({
      where: { id: scentId, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existed = await this.scentRepository.findOne({
      where: {
        name: updateScentDto.name,
        createdBy: userId,
      },
    });

    if (existed && existed.id !== scentId) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    let image = found.image;

    // Check if we should remove the image
    if (updateScentDto.isRemoveImage && file) {
      const fileName = `scents/${Date.now()}`;

      const uploadedImage = await this.storageService.uploadImage(file, fileName);

      image = uploadedImage.origin;

      delete updateScentDto.isRemoveImage;
    }

    // Parse the tags if they're a JSON string
    const parsedTags = updateScentDto.tags ? JSON.parse(updateScentDto.tags) : [];

    // Prepare the updated scent data
    const updatedScentData = {
      ...updateScentDto,
      tags: parsedTags, // Ensure tags are an array
      image,
    };

    // Update the scent in the repository
    const updated = await this.scentRepository.update(scentId, updatedScentData);

    return updated;
  }

  async delete(userId: string, scentId: string) {
    const found = await this.scentRepository.findOne({
      where: { id: scentId, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return await this.scentRepository.delete(scentId);
  }

  async getPublic(queries: ApiBaseGetListQueries): Promise<Pagination<Scent>> {
    const { page, perPage, search } = queries;
    //Get list userId public
    const publicUsers = await this.userSettingRepository.find({
      where: { isPublic: true },
      select: ['userId'],
    });

    const publicUserIds = publicUsers.map((u) => u.userId);

    if (publicUserIds.length === 0) {
      return {
        items: [],
        pagination: {
          total: 0,
          page,
          perPage,
        },
      };
    }

    const where: any = {
      createdBy: In(publicUserIds),
    };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const result = await paginate(this.scentRepository, {
      where,
      params: queries,
    });

    return {
      items: result.items.map((el) => ({
        ...el,
        image: el.image ? convertURLToS3Readable(el.image) : '',
      })),
      pagination: result.pagination,
    };
  }
}
