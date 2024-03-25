import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async getWishLists() {
    const wishList = await this.findMany({
      relations: {
        items: true,
        owner: true,
      },
    });
    wishList.map((wish) => {
      delete wish.owner.password;
      delete wish.owner.email;
    });
    return wishList;
  }

  async create(createWishlistDto: CreateWishlistDto, user: User) {
    delete user.password;
    delete user.email;
    const { itemsId } = createWishlistDto;
    const items = await this.wishesService.findBy(itemsId);
    const wishList = {
      ...createWishlistDto,
      items,
      owner: user,
    };
    return this.wishlistsRepository.save(wishList);
  }

  async getWishListById(id: number) {
    const wishList = await this.findOne({
      where: { id },
      relations: { items: true, owner: true },
    });
    if (!wishList) throw new NotFoundException('Коллекция не найдена');
    delete wishList.owner.password;
    delete wishList.owner.email;
    return wishList;
  }

  async update(
    userId: number,
    id: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishList = await this.getWishListById(id);

    if (wishList.owner.id !== userId)
      throw new ForbiddenException(
        'Вы можете редактировать только свои коллекции!',
      );
    const { itemsId } = updateWishlistDto;
    const items = await this.wishesService.findBy(itemsId);
    const updateWishList = {
      ...updateWishlistDto,
      items,
    };
    this.wishlistsRepository.update(id, updateWishList);
    return this.getWishListById(id);
  }

  async remove(id: number, userId: number) {
    const wishList = await this.getWishListById(id);
    if (wishList.owner.id !== userId)
      throw new ForbiddenException('Вы можете удалять только свои коллекции!');
    await this.wishlistsRepository.delete(id);
    return wishList;
  }

  findOne(query: FindOneOptions<Wishlist>) {
    return this.wishlistsRepository.findOne(query);
  }

  findMany(query: FindManyOptions<Wishlist>) {
    return this.wishlistsRepository.find(query);
  }
}
