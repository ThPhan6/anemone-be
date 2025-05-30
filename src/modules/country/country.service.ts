import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'common/entities/country.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async get(search?: string) {
    const countries = await this.countryRepository.find({
      where: {
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      select: ['id', 'name'],
    });

    return countries;
  }
}
