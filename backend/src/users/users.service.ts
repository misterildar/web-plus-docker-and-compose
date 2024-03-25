import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HelpersService } from 'src/helpers/helpers.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private helpersService: HelpersService,
  ) {}

  getMe(user: User) {
    this.deletePasswordAndEmail(user);
    return user;
  }

  async updateMe(id: number, updateUserDto: UpdateUserDto) {
    const { username, email, password } = updateUserDto;
    if (username) {
      const existUserName = await this.findOne({
        where: { username },
      });
      if (existUserName) {
        throw new ForbiddenException(
          'Такое имя уже существует, выберите пожалуйста другое',
        );
      }
    }
    if (email) {
      const existUserEmail = await this.findOne({
        where: { email },
      });
      if (existUserEmail) {
        throw new ForbiddenException(
          'Такой email уже существует, выберите пожалуйста другой',
        );
      }
    }
    if (password) {
      updateUserDto.password = await this.helpersService.hashPassword(password);
    }
    await this.userRepository.update(id, updateUserDto);
    const { ...updateUserData } = await this.findOne({ where: { id } });
    this.deletePasswordAndEmail(updateUserData);
    return updateUserData;
  }

  async getMeWishes(id: number) {
    const user = await this.findOne({
      where: { id },
      relations: {
        wishes: { owner: true },
      },
    });
    this.deletePasswordAndEmail(user);
    return user.wishes;
  }

  async getUserByName(username: string) {
    return await this.findOne({ where: { username } });
  }

  async getUserNameWishes(username: string) {
    const user = await this.findOne({
      where: { username },
      relations: { wishes: true },
    });
    return user.wishes;
  }

  async findUserByNameOrEmail(emailOrName: string) {
    const [...user] = await this.findMany({
      where: [{ username: emailOrName }, { email: emailOrName }],
    });
    this.deletePasswordAndEmail(user[0]);
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    const existEmail = await this.findOne({ where: { email } });
    if (existEmail) {
      throw new ForbiddenException('Пользователь с таким email уже существует');
    }
    const existUserName = await this.findOne({ where: { username } });
    if (existUserName) {
      throw new ForbiddenException(
        'Пользователь с таким именем уже существует',
      );
    }
    const hachPassword = await this.helpersService.hashPassword(password);
    const user = await this.userRepository.save({
      ...createUserDto,
      password: hachPassword,
    });
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const { email, id, username } = user;
    const payload = { email, id, username };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  findOne(query: FindOneOptions<User>) {
    return this.userRepository.findOne(query);
  }

  findMany(query: FindManyOptions<User>) {
    return this.userRepository.find(query);
  }

  deletePasswordAndEmail(user: User) {
    delete user.password;
    delete user.email;
    return user;
  }
}
