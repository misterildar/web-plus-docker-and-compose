import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, user: User) {
    const wish = {
      ...createWishDto,
      owner: user,
    };
    await this.wishesRepository.save(wish);
    return {};
  }

  async findMany(query: FindManyOptions<Wish>) {
    return await this.wishesRepository.find(query);
  }

  async findOne(query: FindOneOptions<Wish>) {
    return await this.wishesRepository.findOne(query);
  }

  async findBy(id: number[]) {
    return this.wishesRepository.findBy({ id: In(id) });
  }

  async getLastWishes() {
    return await this.findMany({ order: { createdAt: 'DESC' }, take: 40 });
  }

  async getTopWishes() {
    return await this.findMany({ order: { copied: 'DESC' }, take: 10 });
  }

  async getWishById(id: number) {
    const wish = await this.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: true,
        wishlists: true,
      },
    });
    if (!wish) throw new NotFoundException('Подарок не найден');
    delete wish.owner.password;
    delete wish.owner.email;
    return wish;
  }

  async updateById(userId: number, id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.getWishById(id);
    if (wish.owner.id !== userId)
      throw new ForbiddenException(
        'Вы можете редактировать только свои подарки!',
      );
    if (updateWishDto.price > wish.price && wish.raised > 0) {
      throw new ForbiddenException(
        'Вы можете изменять стоимость только тех подарков на которые еще не начался сбор средств!',
      );
    }
    await this.wishesRepository.update(id, updateWishDto);
    return {};
  }

  async removeOne(id: number, userId: number) {
    const wish = await this.getWishById(id);
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои подарки!');
    }
    if (wish.raised > 0) {
      throw new ForbiddenException(
        'Вы можете удалить только тот подарок на который еще не начался сбор средств!',
      );
    }
    await this.wishesRepository.delete(id);
    return wish;
  }

  async wishCopy(wishId: number, user: User) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: { owner: true },
    });
    const { name, link, image, price, description } = wish;
    const isExistWish = await this.findOne({
      where: { name, link, image, price, owner: { id: user.id } },
      relations: { owner: true },
    });
    if (!!isExistWish) {
      throw new ForbiddenException('Вы уже копировали себе этот подарок');
    }
    await this.wishesRepository.update(wishId, { copied: +wish.copied + 1 });
    const wishCopy = {
      name,
      link,
      image,
      price,
      description,
      owner: user,
    };
    await this.create(wishCopy, user);
    return {};
  }

  async updateRaised(id: number, updateWishDto: UpdateWishDto) {
    return await this.wishesRepository.update(id, updateWishDto);
  }
}
