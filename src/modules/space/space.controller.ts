import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../core/controllers/base.controller';
import { ApiController } from '../../core/decorator/apiController.decorator';
import { MemberRoleGuard } from '../../core/decorator/auth.decorator';
import { AuthUser } from '../../core/decorator/auth-user.decorator';
import { UserDto } from '../auth/dto/auth-user.dto';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/space-request.dto';
import { SpaceService } from './space.service';

@MemberRoleGuard()
@ApiController({
  name: 'spaces',
})
export class SpaceController extends BaseController {
  constructor(private readonly spaceService: SpaceService) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Get all spaces by user id' })
  async get(@AuthUser() user: UserDto) {
    const spaces = await this.spaceService.get(user.sub);

    return spaces;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail space by id' })
  async getById(@AuthUser() user: UserDto, @Param('id') id: string) {
    const space = await this.spaceService.getById(user.sub, id);

    return space;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new space' })
  async create(@AuthUser() user: UserDto, @Body() body: CreateSpaceDto) {
    const space = await this.spaceService.create(user.sub, body);

    return space;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a space' })
  async update(@AuthUser() user: UserDto, @Param('id') id: string, @Body() body: UpdateSpaceDto) {
    const space = await this.spaceService.update(user.sub, id, body);

    return space;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a space' })
  async delete(@AuthUser() user: UserDto, @Param('id') id: string) {
    const space = await this.spaceService.delete(user.sub, id);

    return space;
  }
}
