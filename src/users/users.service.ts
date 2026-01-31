import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserCreateInput,
  UserModel,
  UserWhereUniqueInput,
} from '../../generated/prisma/models/User';
import { User } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  @Inject() prisma: PrismaService;

  async create(data: UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findUnique(params: UserWhereUniqueInput) {
    return this.prisma.user.findUnique({ where: { ...params } });
  }
}
