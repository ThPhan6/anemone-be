import { Get, Query } from '@nestjs/common';
import { ApiController } from 'core/decorator/apiController.decorator';

import { CountryService } from './country.service';

@ApiController({
  name: 'countries',
})
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  async getCountries(@Query('search') search?: string) {
    return this.countryService.get(search);
  }
}
