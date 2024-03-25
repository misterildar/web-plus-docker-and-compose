import {
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Controller,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/utils/request-user';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return this.usersService.getMe(req.user);
  }

  @Patch('me')
  update(@Req() req: RequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  getMeWishes(@Req() req: RequestWithUser) {
    return this.usersService.getMeWishes(req.user.id);
  }

  @Get(':username')
  getName(@Param('username') username: string) {
    return this.usersService.getUserByName(username);
  }

  @Get(':username/wishes')
  getUserNameWishes(@Param('username') username: string) {
    return this.usersService.getUserNameWishes(username);
  }

  @Post('find')
  findUserByNameOrEmail(@Body() nameOrEmail: { query: string }) {
    return this.usersService.findUserByNameOrEmail(nameOrEmail.query);
  }
}
