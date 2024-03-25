import {
  IsUrl,
  Length,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Entity, Column, ManyToOne, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from 'src/utils/base-entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Entity()
export class Wishlist extends BaseEntity {
  @Column()
  @IsString()
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 1500)
  description: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, (wish) => wish.wishlists)
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;
}
