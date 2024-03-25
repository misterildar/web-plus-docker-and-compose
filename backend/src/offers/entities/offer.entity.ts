import { IsInt } from 'class-validator';
import { Entity, Column, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/utils/base-entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Entity()
export class Offer extends BaseEntity {
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @IsInt()
  amount: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  hidden: boolean;

  @ManyToOne(() => User, (user) => user.offers)
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers)
  item: Wish;
}
