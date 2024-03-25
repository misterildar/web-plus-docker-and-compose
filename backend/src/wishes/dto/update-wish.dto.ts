import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

import { CreateWishDto } from './create-wish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional()
  @IsInt()
  raised: number;
}
