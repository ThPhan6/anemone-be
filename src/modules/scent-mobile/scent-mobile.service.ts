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
import { Device } from '../device/entities/device.entity';
import { CommandType, DeviceCommand } from '../device/entities/device-command.entity';
import { Product } from '../device/entities/product.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../setting-definition/entities/setting-definition.entity';
import { StorageService } from '../storage/storage.service';
import {
  CartridgeInfoDto,
  CreateScentMobileDto,
  TestScentDto,
  UpdateScentMobileDto,
} from './dto/scent-mobile-request.dto';

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
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cognitoService: CognitoService,
    @InjectRepository(ScentConfig)
    private readonly scentConfigRepository: Repository<ScentConfig>,
    @InjectRepository(DeviceCommand)
    private readonly deviceCommandRepository: Repository<DeviceCommand>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
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

  private async validateScentConfig(cartridgeInfo: CartridgeInfoDto[], intensity: number) {
    //check validate cartridges
    for (const cart of cartridgeInfo) {
      //check scent config is exist
      const scentConfig = await this.scentConfigRepository.findOne({
        where: { id: cart.id },
      });

      if (!scentConfig) {
        throw new HttpException(
          `Scent config with id ${cart.id} is not exist`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate intensity range for each cartridge
      if (cart.intensity < 1 || cart.intensity > 5) {
        throw new HttpException(
          `Intensity for serial number ${scentConfig.name} must be between 1 and 5`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    //check special case intensity
    if (cartridgeInfo.length === 1 && intensity !== cartridgeInfo[0].intensity) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.INVALID_INTENSITY, HttpStatus.BAD_REQUEST);
    }
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

    //check validate cartridges
    await this.validateScentConfig(JSON.parse(bodyRequest.cartridgeInfo), bodyRequest.intensity);

    let uploadedImageUrl = '';

    if (file) {
      const fileName = `scents/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      uploadedImageUrl = uploadedImage.fileName;
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

    if (updateScentDto.cartridgeInfo) {
      //check validate cartridges
      await this.validateScentConfig(
        JSON.parse(updateScentDto.cartridgeInfo),
        updateScentDto.intensity,
      );
    }

    let image = found.image;

    // Check if we should remove the image
    if (updateScentDto.isRemoveImage && file) {
      const fileName = `scents/${Date.now()}`;

      const uploadedImage = await this.storageService.uploadImage(file, fileName);

      image = uploadedImage.fileName;

      delete updateScentDto.isRemoveImage;
    }

    // Prepare the updated scent data
    const updatedScentData = {
      ...updateScentDto,
      tags: updateScentDto.tags ? updateScentDto.tags : found.tags,
      cartridgeInfo: updateScentDto.cartridgeInfo
        ? updateScentDto.cartridgeInfo
        : found.cartridgeInfo,
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

  async testScent(dto: TestScentDto) {
    const device = await this.deviceRepository.findOne({
      where: { product: { serialNumber: dto.deviceId } },
    });

    if (!device) {
      throw new HttpException(MESSAGE.DEVICE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!device.isConnected) {
      throw new HttpException(MESSAGE.DEVICE.NOT_CONNECTED, HttpStatus.BAD_REQUEST);
    }

    //check validate scent config
    await this.validateScentConfig(dto.cartridgeInfo, dto.intensity);

    //update command
    const commands = await this.deviceCommandRepository.find({
      where: { device: { id: device.id }, isExecuted: false },
    });

    if (commands.length > 0) {
      for (const command of commands) {
        await this.deviceCommandRepository.update(command.id, {
          isExecuted: true,
          deletedAt: new Date(),
        });
      }
    }

    //send command to device
    const command = await this.deviceCommandRepository.create({
      device: { id: device.id },
      command: {
        type: CommandType.TEST,
        intensity: dto.intensity,
        cartridgeInfo: dto.cartridgeInfo,
      },
      isExecuted: false,
    });

    await this.deviceCommandRepository.save(command);

    return true;
  }
}
