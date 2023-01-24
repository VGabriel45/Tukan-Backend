import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import RefreshToken from './entities/refreshToken.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  refreshTokens: RefreshToken[] = [];

  async refresh(refreshStr: string): Promise<string | undefined> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);

    if (!refreshToken) {
      return undefined;
    }
    const user = await this.userService.getUserByRefreshToken(refreshToken);
    if (!user) {
      return undefined;
    }
    const accessToken = {
      userId: refreshToken.userId,
    };
    return sign(accessToken, process.env.ACCESS_SECRET, { expiresIn: '1h' });
  }

  retrieveRefreshToken(refreshStr: string): Promise<RefreshToken | undefined> {
    try {
      const decoded = verify(refreshStr, process.env.REFRESH_SECRET);
      if (typeof decoded === 'string') {
        return undefined;
      }

      return Promise.resolve(
        this.refreshTokens.find(
          (token: RefreshToken) => token.id === decoded.id,
        ),
      );
    } catch (error) {
      console.log('error');

      return undefined;
    }
  }

  async signIn(
    email: string,
    password: string,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string } | undefined> {
    const user: User = await this.userService.getUserByEmail(email);
    if (!user) {
      return undefined;
    }
    if (user.password !== password) {
      return undefined;
    }
    return this.newRefreshAndAccessToken(user, values);
  }

  async signUp(
    username: string,
    email: string,
    password: string,
  ): Promise<{ username: string; email: string } | undefined> {
    const user: User = await this.userService.getUserByEmail(email);
    if (user) {
      return undefined;
    }
    return this.userService.createUser(username, email, password);
  }

  private async newRefreshAndAccessToken(
    user: User,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenObj = new RefreshToken({
      id: uuidv4(),
      ...values,
      userId: user.userId,
    });
    this.refreshTokens.push(refreshTokenObj);
    return {
      refreshToken: refreshTokenObj.sign(),
      accessToken: sign(
        {
          userId: user.userId,
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: '1h',
        },
      ),
    };
  }

  async logout(refreshStr: string): Promise<void> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);
    if (!refreshToken) {
      return;
    }
    this.userService.deleteRefreshToken(refreshStr, { refreshToken: null });
  }
}
