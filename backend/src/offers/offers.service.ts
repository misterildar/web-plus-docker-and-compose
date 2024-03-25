import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, Injectable } from '@nestjs/common';

import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const { itemId, amount } = createOfferDto;
    const wish = await this.wishesService.getWishById(itemId);
    if (wish.owner.id === user.id)
      throw new ForbiddenException(
        'Вы можете поддержать подарки созданные другими пользователями!, а это ваш подарок :)',
      );

    if (wish.price === wish.raised) {
      throw new ForbiddenException(
        'Необходимая сумма уже собрана, выберите другой подарок',
      );
    }

    if (+amount + +wish.raised > +wish.price) {
      throw new ForbiddenException(
        `Укажите сумму ${
          wish.price - wish.raised
        } рублей, ваша сумма превышает недостающую часть`,
      );
    }
    this.wishesService.updateRaised(itemId, {
      raised: +wish.raised + +amount,
    });

    const newOffer = {
      ...createOfferDto,
      user,
      item: wish,
    };
    this.offersRepository.save(newOffer);
    return {};
  }

  async findAll() {
    return await this.offersRepository.find({
      relations: {
        item: true,
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.offersRepository.findOne({
      where: { id },
      relations: {
        item: true,
        user: true,
      },
    });
  }
}
