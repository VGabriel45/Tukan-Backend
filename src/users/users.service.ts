import { Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UsersRepository } from './users.repository';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import RefreshToken from 'src/auth/entities/refreshToken.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserById(userId: string): Promise<User> {
    return this.usersRepository.findOne({ userId });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ email });
  }

  async getRefreshToken(refreshTokenId: string): Promise<RefreshToken> {
    return (
      await this.usersRepository.findOne({ 'refreshToken.id': refreshTokenId })
    ).refreshToken;
  }

  async getUserByRefreshToken(refreshTokenId: string): Promise<User> {
    return await this.usersRepository.findOne({
      'refreshToken.id': refreshTokenId,
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({});
  }

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    return this.usersRepository.create({
      userId: uuidv4(),
      username,
      email,
      refreshToken: null,
      password, //*TODO hash password
    });
  }

  async updateUser(userId: string, userUpdates: UpdateUserDto): Promise<User> {
    return this.usersRepository.findOneAndUpdate({ userId }, userUpdates);
  }

  async deleteRefreshToken(
    refreshToken: string,
    userUpdates: UpdateUserDto,
  ): Promise<User> {
    return this.usersRepository.findOneAndUpdate({ refreshToken }, userUpdates);
  }
}
