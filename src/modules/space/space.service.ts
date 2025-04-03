import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Space } from '../../common/entities/space.entity';
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

  async get(userId: string) {
    const spaces = await this.spaceRepository.find({
      where: {
        createdBy: userId,
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

    return spaces.map((space) => ({
      ...space,
      totalDevices: devices.filter((device) => device.space.id === space.id).length,
    }));
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
