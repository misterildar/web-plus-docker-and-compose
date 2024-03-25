import {
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/utils/request-user';

@Controller('wishlistlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  getWishLists() {
    return this.wishlistsService.getWishLists();
  }

  @Post()
  create(
    @Body() createWishlistDto: CreateWishlistDto,
    @Req() req: RequestWithUser,
  ) {
    return this.wishlistsService.create(createWishlistDto, req.user);
  }

  @Get(':id')
  getWishListById(@Param('id') id: string) {
    return this.wishlistsService.getWishListById(+id);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.update(req.user.id, +id, updateWishlistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.wishlistsService.remove(+id, req.user.id);
  }
}
