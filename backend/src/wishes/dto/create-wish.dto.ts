import { IsUrl, Length, IsInt, IsString } from 'class-validator';

export class CreateWishDto {
  @Length(1, 250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsInt()
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
