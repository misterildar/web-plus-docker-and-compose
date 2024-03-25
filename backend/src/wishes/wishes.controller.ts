import {
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/utils/request-user';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @Req() req: RequestWithUser) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @Get('last')
  getLastWishes() {
    return this.wishesService.getLastWishes();
  }

  @Get('top')
  getTopWishes() {
    return this.wishesService.getTopWishes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getWishById(@Param('id') id: string) {
    return this.wishesService.getWishById(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateById(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return this.wishesService.updateById(req.user.id, +id, updateWishDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.wishesService.removeOne(+id, req.user.id);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copy(@Param('id') wishId: string, @Req() req: RequestWithUser) {
    return this.wishesService.wishCopy(+wishId, req.user);
  }
}
