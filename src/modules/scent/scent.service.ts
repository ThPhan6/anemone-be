import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sortBy } from 'lodash';
import { ILike, In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { UserSetting } from '../../common/entities/user-setting.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { paginate } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { CognitoService } from '../auth/cognito.service';
import { Device } from '../device/entities/device.entity';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { CommandType, DeviceCommand } from '../device/entities/device-command.entity';
import { Product } from '../device/entities/product.entity';
import { ScentConfig } from '../scent-config/entities/scent-config.entity';
import { StorageService } from '../storage/storage.service';
import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../system/entities/setting-definition.entity';
import {
  CartridgeInfoDto,
  CreateScentDto,
  TestScentDto,
  UpdateScentDto,
} from './dto/scent-request.dto';

@Injectable()
export class ScentService {
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
    @InjectRepository(DeviceCartridge)
    private readonly deviceCartridgeRepository: Repository<DeviceCartridge>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(PlaylistScent)
    private readonly playlistScentRepository: Repository<PlaylistScent>,
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

    const categories = await this.settingDefinitionRepository.find({
      where: { type: ESystemDefinitionType.SCENT_TAG },
    });

    const newItems = result.items.map((el) => {
      const categoryTags = categories
        .filter((category) => JSON.parse(el.tags).includes(category.id))
        .map((category) => ({
          id: category.id,
          name: category.name,
          image: category.metadata.image ? convertURLToS3Readable(category.metadata.image) : '',
          description: category.metadata.name,
        }));

      return {
        ...el,
        tags: categoryTags,
        image: el.image ? convertURLToS3Readable(el.image) : '',
        createdBy: userInfo,
      };
    });

    return {
      items: newItems,
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
        image: category.metadata.image ? convertURLToS3Readable(category.metadata.image) : '',
        description: category.metadata.name,
      }));

    const scentConfigs = JSON.parse(scent.cartridgeInfo || '[]');

    const scentConfigIds = scentConfigs.map((el) => el.id);

    const cartridgeInfo = [];

    const userSession = await this.userSessionRepository.findOne({
      where: { scent: { id: scentId } },
      order: { createdAt: 'DESC' },
      relations: ['device'],
    });

    // Get all products by scentConfig ids
    const products = await this.productRepository.find({
      where: {
        scentConfig: { id: In(scentConfigIds) },
      },
      relations: ['scentConfig'],
    });

    const productIds = products.map((p) => p.id);

    // Get all deviceCartridges matching deviceId and productId
    const deviceCartridges = await this.deviceCartridgeRepository.find({
      where: {
        device: { id: userSession?.device?.id },
        product: { id: In(productIds) },
      },
      relations: ['product'],
    });

    // Map productId -> position
    const cartridgeMap = new Map<string, number>();
    for (const cartridge of deviceCartridges) {
      cartridgeMap.set(cartridge.product.id, Number(cartridge.position));
    }

    for (const el of scentConfigs) {
      const scentConfig = await this.scentConfigRepository.findOne({
        where: { id: el.id },
      });

      const product = products.find((p) => p.scentConfig.id === el.id);

      const position = cartridgeMap.get(product?.id);

      cartridgeInfo.push({
        ...scentConfig,
        intensity: el.intensity,
        position,
      });
    }

    const userInfo = await this.cognitoService.getUserByUserId(scent.createdBy);

    return {
      ...scent,
      image: scent.image ? convertURLToS3Readable(scent.image) : '',
      tags: categoryTags,
      cartridgeInfo: sortBy(cartridgeInfo, 'position'),
      createdBy: userInfo,
      userId: scent.createdBy,
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

  async create(userId: string, bodyRequest: CreateScentDto, file: Express.Multer.File) {
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
    updateScentDto: UpdateScentDto,
    file: Express.Multer.File,
  ) {
    const found = await this.scentRepository.findOne({
      where: { id: scentId, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const scentName = updateScentDto.name || found.name;

    const existed = await this.scentRepository.findOne({
      where: {
        name: scentName,
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

    if (file) {
      const fileName = `scents/${Date.now()}`;

      const uploadedImage = await this.storageService.uploadImage(file, fileName);

      image = uploadedImage.fileName;
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

  async replace(
    userId: string,
    scentId: string,
    bodyRequest: CreateScentDto,
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
        name: bodyRequest.name,
        createdBy: userId,
      },
    });

    if (existed && existed.id !== scentId) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    //check validate cartridges
    await this.validateScentConfig(JSON.parse(bodyRequest.cartridgeInfo), bodyRequest.intensity);

    let image = '';

    if (file) {
      const fileName = `scents/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      image = uploadedImage.fileName;
    }

    const updatedScentData = {
      ...bodyRequest,
      image,
    } as any;

    return await this.scentRepository.update(scentId, updatedScentData);
  }

  async delete(userId: string, scentId: string) {
    const found = await this.scentRepository.findOne({
      where: { id: scentId, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.playlistScentRepository.softDelete({ scent: { id: scentId } });

    return await this.scentRepository.softDelete(scentId);
  }

  async getPublic(queries: ApiBaseGetListQueries, random: boolean): Promise<Pagination<Scent>> {
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

    if (random) {
      const scents = await this.scentRepository
        .createQueryBuilder('scent')
        .where('scent.createdBy IN (:...userIds)', { userIds: publicUserIds })
        .orderBy('RANDOM()')
        .limit(4)
        .getMany();

      return {
        items: scents.map((el) => ({
          ...el,
          image: el.image ? convertURLToS3Readable(el.image) : '',
        })),
        pagination: {
          total: scents.length,
          page,
          perPage,
        },
      };
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

  async getByScentTag() {
    const scentTags = await this.settingDefinitionRepository.find({
      where: { type: ESystemDefinitionType.SCENT_TAG },
      order: { createdAt: 'ASC' },
    });

    const firstScentTag = scentTags[0];

    const scentTagId = firstScentTag.id;

    const publicUsers = await this.userSettingRepository.find({
      where: { isPublic: true },
    });

    const publicUserIds = publicUsers.map((el) => el.userId);

    if (publicUserIds.length === 0) {
      return {
        name: firstScentTag.name,
        scents: [],
      };
    }

    const scents = await this.scentRepository
      .createQueryBuilder('scent')
      .where('scent.createdBy IN (:...userIds)', {
        userIds: publicUserIds,
      })
      .getMany();

    const scentsByTag = scents.filter((el) => JSON.parse(el.tags).includes(scentTagId));

    return {
      name: firstScentTag.name,
      scents: scentsByTag.map((el) => ({
        id: el.id,
        name: el.name,
        image: el.image ? convertURLToS3Readable(el.image) : '',
      })),
    };
  }
}
