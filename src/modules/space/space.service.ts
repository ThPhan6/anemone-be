import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Space } from '../../common/entities/space.entity';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { Device } from '../device/entities/device.entity';
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
    const { page, perPage } = queries;

    const [spaces, total] = await this.spaceRepository.findAndCount({
      where: {
        createdBy: userId,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      order: {
        createdAt: 'DESC',
      },
    });

    const spaceIds = spaces.map((space) => space.id);

    const devices = await this.deviceRepository.find({
      where: {
        space: {
          id: In(spaceIds),
        },
      },
      relations: ['space'],
    });

    return {
      items: spaces.map((space) => ({
        ...space,
        totalDevices: devices.filter((device) => device.space.id === space.id).length,
      })),
      pagination: {
        total,
        page,
        perPage,
      },
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
        { space: null, isConnected: false, registeredBy: null },
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
    });

    return { ...found, devices };
  }
}
