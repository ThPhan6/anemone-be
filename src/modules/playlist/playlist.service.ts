import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MESSAGE } from '../../common/constants/message.constant';
import { Playlist } from '../../common/entities/playlist.entity';
import { PlaylistScent } from '../../common/entities/playlist-scent.entity';
import { Scent } from '../../common/entities/scent.entity';
import { AddScentToPlayListDto } from './dto/add-scent-to-playlist.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
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
  ) {}

  async get(userId: string) {
    const playlists = await this.playlistRepository.find({
      where: {
        createdBy: userId,
      },
    });

    return playlists;
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

    // Format the response to include the scents in the playlist
    const playlistDetail = {
      id: playlist.id,
      name: playlist.name,
      image: playlist.image,
      createdBy: playlist.createdBy,
      scents: playlist.playlistScents.map((ps) => ({
        scentId: ps.scent.id,
        scentName: ps.scent.name,
        scentImage: ps.scent.image,
        intensity: ps.scent.intensity,
        description: ps.scent.description,
        sequence: ps.sequence, // Add the sequence for the scent
      })),
    };

    return playlistDetail;
  }

  async create(userId: string, bodyRequest: CreatePlaylistDto) {
    const existed = await this.playlistRepository.findOne({
      where: {
        name: bodyRequest.name,
        createdBy: userId,
      },
    });

    if (existed) {
      throw new HttpException(MESSAGE.PLAYLIST.ALREADY_EXIST, HttpStatus.BAD_REQUEST);
    }

    const playlist = await this.playlistRepository.save({
      ...bodyRequest,
      image: '',
      createdBy: userId,
    });

    return playlist;
  }

  async update(userId: string, id: string, bodyRequest: CreatePlaylistDto) {
    const playlist = await this.playlistRepository.findOne({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const existed = await this.playlistRepository.findOne({
      where: {
        name: bodyRequest.name,
        createdBy: userId,
      },
    });

    if (existed && existed.id !== id) {
      throw new HttpException(MESSAGE.PLAYLIST.ALREADY_EXIST, HttpStatus.BAD_REQUEST);
    }

    const updatedPlaylist = await this.playlistRepository.update(id, {
      ...bodyRequest,
    });

    return updatedPlaylist;
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

    await this.playlistScentRepository.delete({ playlist: { id } });

    const playlist = await this.playlistRepository.delete(id);

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

  async getScentsOfPlaylist(playlistId: string) {
    const playlist = await this.playlistRepository.findOne({ where: { id: playlistId } });

    if (!playlist) {
      throw new HttpException(MESSAGE.PLAYLIST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const playlistScents = await this.playlistScentRepository.find({
      where: { playlist: { id: playlistId } },
      relations: ['scent'],
      order: { sequence: 'ASC' },
    });

    return playlistScents.map((ps) => ({
      id: ps.scent.id,
      name: ps.scent.name,
      image: ps.scent.image,
      intensity: ps.scent.intensity,
      cartridgeInfo: ps.scent.cartridgeInfo,
      tags: ps.scent.tags,
      description: ps.scent.description,
      sequence: ps.sequence,
    }));
  }
}
