import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Space } from '../../common/entities/space.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { paginate } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { ConnectionStatus, Device } from '../device/entities/device.entity';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/space-request.dto';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async get(userId: string, queries: ApiBaseGetListQueries): Promise<Pagination<Space>> {
    const { items, pagination } = await paginate(this.spaceRepository, {
      where: {
        createdBy: userId,
      },
      params: queries,
    });

    const spaceIds = items.map((space) => space.id);

    const devices = await this.deviceRepository.find({
      where: {
        space: {
          id: In(spaceIds),
        },
      },
      relations: ['space'],
    });

    return {
      items: items.map((space) => ({
        ...space,
        totalDevices: devices.filter((device) => device.space.id === space.id).length,
      })),
      pagination,
    };
  }

  async create(userId: string, body: CreateSpaceDto) {
    const existingSpace = await this.spaceRepository.findOne({
      where: {
        name: body.name,
        createdBy: userId,
      },
    });

    if (existingSpace) {
      throw new HttpException(MESSAGE.SPACE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const space = await this.spaceRepository.save({
      ...body,
      createdBy: userId,
    });

    return space;
  }

  async update(userId: string, id: string, body: UpdateSpaceDto) {
    const found = await this.spaceRepository.findOne({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SPACE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existingSpace = await this.spaceRepository.findOne({
      where: {
        name: body.name,
        createdBy: userId,
      },
    });

    if (existingSpace) {
      throw new HttpException(MESSAGE.SPACE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const space = await this.spaceRepository.update(id, body);

    return space;
  }

  async delete(userId: string, id: string) {
    const found = await this.spaceRepository.findOne({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SPACE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const devicesInSpace = await this.deviceRepository.find({
      where: { space: { id } },
    });

    if (devicesInSpace.length > 0) {
      await this.deviceRepository.update(
        { space: { id } },
        {
          space: null,
          connectionStatus: ConnectionStatus.DISCONNECTED_BY_DEVICE,
          registeredBy: null,
        },
      );
    }

    const space = await this.spaceRepository.delete(id);

    return space;
  }

  async getById(userId: string, id: string) {
    const found = await this.spaceRepository.findOne({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!found) {
      throw new HttpException(MESSAGE.SPACE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const devices = await this.deviceRepository.find({
      where: {
        space: {
          id,
        },
      },
      relations: ['product', 'product.productVariant'],
    });

    return {
      ...found,
      devices: devices.map((device) => ({
        ...device,
        isConnected: device.connectionStatus === ConnectionStatus.CONNECTED,
        product: {
          ...device.product,
          image: device.product.productVariant.image
            ? convertURLToS3Readable(device.product.productVariant.image)
            : null,
        },
      })),
    };
  }
}
