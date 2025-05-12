import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { AlbumPlaylist } from '../../common/entities/album-playlist.entity';
import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { UserSession } from '../../common/entities/user-session.entity';
import { convertURLToS3Readable } from '../../common/utils/file';
import { paginate } from '../../common/utils/helper';
import { ApiBaseGetListQueries } from '../../core/types/apiQuery.type';
import { Pagination } from '../../core/types/response.type';
import { CognitoService } from '../auth/cognito.service';
import { DeviceCartridge } from '../device/entities/device-cartridge.entity';
import { Product } from '../device/entities/product.entity';
import { StorageService } from '../storage/storage.service';
import { ScentConfig } from '../system/entities/scent-config.entity';
import {
  ESystemDefinitionType,
  SettingDefinition,
} from '../system/entities/setting-definition.entity';
import { AddScentToPlayListDto } from './dto/add-scent-to-playlist.dto';
import { CreatePlaylistDto, UpdatePlaylistDto } from './dto/create-playlist.dto';
import { updateScentInPlaylistDto } from './dto/update-scent-in-playlist.dto';
@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Scent)
    private scentRepository: Repository<Scent>,
    @InjectRepository(PlaylistScent)
    private playlistScentRepository: Repository<PlaylistScent>,
    private cognitoService: CognitoService,
    @InjectRepository(ScentConfig)
    private scentConfigRepository: Repository<ScentConfig>,
    @InjectRepository(SettingDefinition)
    private settingDefinitionRepository: Repository<SettingDefinition>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(DeviceCartridge)
    private deviceCartridgeRepository: Repository<DeviceCartridge>,
    private storageService: StorageService,
    @InjectRepository(AlbumPlaylist)
    private albumPlaylistRepository: Repository<AlbumPlaylist>,
  ) {}

  async get(
    userId: string,
    queries: ApiBaseGetListQueries,
  ): Promise<Pagination<Partial<Playlist>>> {
    const search = queries.search;

    const { items, pagination } = await paginate(this.playlistRepository, {
      where: {
        createdBy: userId,
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      params: queries,
      relations: ['playlistScents', 'playlistScents.scent'],
    });

    const userInfo = await this.cognitoService.getUserByUserId(userId);

    return {
      items: items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        image: playlist.image
          ? convertURLToS3Readable(playlist.image)
          : playlist.playlistScents.length > 0
            ? convertURLToS3Readable(playlist.playlistScents[0].scent.image)
            : '',
        createdBy: userInfo,
        scents: playlist.playlistScents.map((ps) => ({
          id: ps.scent.id,
          name: ps.scent.name,
          image: ps.scent.image ? convertURLToS3Readable(ps.scent.image) : '',
          intensity: ps.scent.intensity,
          description: ps.scent.description,
        })),
      })),
      pagination,
    };
  }

  // Get playlist details with associated scents
  async getById(playlistId: string) {
    // Fetch the playlist by ID with its related scents through the PlaylistScent entity
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: ['playlistScents', 'playlistScents.scent'], // Include playlistScents and the scent for each one
    });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const userInfo = await this.cognitoService.getUserByUserId(playlist.createdBy);

    const scents = [];

    for (const ps of playlist.playlistScents) {
      const scent = ps.scent;

      const cartridgeRaw = JSON.parse(scent.cartridgeInfo || '[]');

      const cartridgeInfo = [];
      for (const el of cartridgeRaw) {
        const scentConfig = await this.scentConfigRepository.findOne({
          where: { id: el.id },
        });
        const product = await this.productRepository.findOne({
          where: { scentConfig: { id: el.id } },
        });

        const userSession = await this.userSessionRepository.findOne({
          where: { scent: { id: scent.id } },
          order: { createdAt: 'DESC' },
          relations: ['device'],
        });

        const cartridge = await this.deviceCartridgeRepository.findOne({
          where: { product: { id: product.id }, device: { id: userSession?.device?.id } },
        });

        const position = Number(cartridge?.position);

        cartridgeInfo.push({ ...scentConfig, intensity: el.intensity, position });
      }

      const scentTags = await this.settingDefinitionRepository.find({
        where: { type: ESystemDefinitionType.SCENT_TAG },
      });

      const tags = scentTags
        .filter((tag) => JSON.parse(scent.tags).includes(tag.id))
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          image: tag.metadata.image ? convertURLToS3Readable(tag.metadata.image) : '',
          description: tag.metadata.name,
        }));

      scents.push({
        id: scent.id,
        name: scent.name,
        image: scent.image ? convertURLToS3Readable(scent.image) : '',
        intensity: scent.intensity,
        description: scent.description,
        sequence: ps.sequence,
        createdBy: userInfo,
        tags,
        cartridgeInfo,
      });
    }

    // Format the response to include the scents in the playlist
    const playlistDetail = {
      id: playlist.id,
      name: playlist.name,
      image: playlist.image
        ? convertURLToS3Readable(playlist.image)
        : playlist.playlistScents.length > 0 && playlist.playlistScents[0].scent.image
          ? convertURLToS3Readable(playlist.playlistScents[0].scent.image)
          : '',
      createdBy: userInfo,
      scents,
    };

    return playlistDetail;
  }

  async create(userId: string, bodyRequest: CreatePlaylistDto, file: Express.Multer.File) {
    const existed = await this.playlistRepository.findOne({
      where: {
        name: bodyRequest.name,
        createdBy: userId,
      },
    });

    if (existed) {
      throw new HttpException(MESSAGE.PLAYLIST.ALREADY_EXIST, HttpStatus.BAD_REQUEST);
    }

    let uploadedImageUrl = '';

    if (file) {
      const fileName = `playlists/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      uploadedImageUrl = uploadedImage.fileName;
    }

    const playlist = await this.playlistRepository.save({
      ...bodyRequest,
      image: uploadedImageUrl,
      createdBy: userId,
    });

    return playlist;
  }

  async update(
    userId: string,
    id: string,
    bodyRequest: UpdatePlaylistDto,
    file: Express.Multer.File,
  ) {
    const playlist = await this.playlistRepository.findOne({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlistName = bodyRequest.name || playlist.name;

    const existed = await this.playlistRepository.findOne({
      where: {
        name: playlistName,
        createdBy: userId,
      },
    });

    if (existed && existed.id !== id) {
      throw new HttpException(MESSAGE.PLAYLIST.ALREADY_EXIST, HttpStatus.BAD_REQUEST);
    }

    let image = playlist.image;

    if (file) {
      const fileName = `playlists/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      image = uploadedImage.fileName;
    }

    const updatedPlaylist = await this.playlistRepository.update(id, {
      image,
      name: playlistName,
    });

    return updatedPlaylist;
  }

  async replace(
    userId: string,
    id: string,
    bodyRequest: CreatePlaylistDto,
    file: Express.Multer.File,
  ) {
    const found = await this.playlistRepository.findOne({
      where: { id, createdBy: userId },
    });

    if (!found) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existed = await this.playlistRepository.findOne({
      where: { name: bodyRequest.name, createdBy: userId },
    });

    if (existed && existed.id !== id) {
      throw new HttpException(MESSAGE.PLAYLIST.ALREADY_EXIST, HttpStatus.BAD_REQUEST);
    }

    let image = found.image;

    if (file) {
      const fileName = `playlists/${Date.now()}`;
      const uploadedImage = await this.storageService.uploadImage(file, fileName);
      image = uploadedImage.fileName;
    }

    return this.playlistRepository.update(id, {
      image,
      name: bodyRequest.name,
    });
  }

  async delete(userId: string, id: string) {
    const found = await this.playlistRepository.findOne({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!found) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.playlistScentRepository.softDelete({ playlist: { id } });

    await this.albumPlaylistRepository.softDelete({ playlist: { id } });

    const playlist = await this.playlistRepository.softDelete(id);

    return playlist;
  }

  async addScentToPlaylist(playlistId: string, addScentDto: AddScentToPlayListDto) {
    const playlist = await this.playlistRepository.findOne({ where: { id: playlistId } });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const scent = await this.scentRepository.findOne({ where: { id: addScentDto.scentId } });

    if (!scent) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlistScent = new PlaylistScent();

    playlistScent.playlist = playlist;

    playlistScent.scent = scent;

    playlistScent.sequence = addScentDto.sequence;

    await this.playlistScentRepository.save(playlistScent);

    return playlistScent;
  }

  async updateScentInPlaylist(
    playlistId: string,
    scentId: string,
    updateScentDto: updateScentInPlaylistDto,
  ) {
    const playlistScent = await this.playlistScentRepository.findOne({
      where: { playlist: { id: playlistId }, scent: { id: scentId } },
    });

    if (!playlistScent) {
      throw new HttpException(MESSAGE.PLAYLIST.SCENT_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    playlistScent.sequence = updateScentDto.sequence;

    return await this.playlistScentRepository.save(playlistScent);
  }

  async removeScentFromPlaylist(playlistId: string, scentId: string) {
    const playlist = await this.playlistRepository.findOne({ where: { id: playlistId } });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const scent = await this.scentRepository.findOne({ where: { id: scentId } });

    if (!scent) {
      throw new HttpException(MESSAGE.SCENT_MOBILE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const result = await this.playlistScentRepository.delete({
      playlist: { id: playlistId },
      scent: { id: scentId },
    });

    return result;
  }

  async getScentsOfPlaylist(userId: string, playlistId: string, queries: ApiBaseGetListQueries) {
    const playlist = await this.playlistRepository.findOne({ where: { id: playlistId } });

    const search = queries.search;

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlistScents = await this.playlistScentRepository.find({
      where: { playlist: { id: playlistId } },
      relations: ['scent'],
      order: { sequence: 'ASC' },
    });

    const { items: scents, pagination } = await paginate(this.scentRepository, {
      where: {
        id: Not(In(playlistScents.map((ps) => ps.scent.id))),
        createdBy: userId,
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      params: queries,
    });

    const userInfo = await this.cognitoService.getUserByUserId(userId);

    return {
      items: scents.map((el) => ({
        id: el.id,
        name: el.name,
        image: el.image ? convertURLToS3Readable(el.image) : '',
        createdBy: userInfo,
      })),
      pagination,
    };
  }
}
