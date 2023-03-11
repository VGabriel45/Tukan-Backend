import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import RefreshToken from './entities/refreshToken.entity';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  refreshTokens: RefreshToken[] = [];

  async refresh(refreshStr: string): Promise<string | void> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const user = await this.userService.getUserByRefreshToken(refreshToken.id);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('Invalid user for refresh token');
    }
    const accessToken = {
      userId: refreshToken.userId,
    };
    return sign(accessToken, process.env.ACCESS_SECRET, { expiresIn: '1d' });
  }

  retrieveRefreshToken(refreshStr: string): Promise<RefreshToken | undefined> {
    try {
      const decoded = verify(refreshStr, process.env.REFRESH_SECRET);
      if (typeof decoded === 'string') {
        return undefined;
      }

      return this.userService.getRefreshToken(decoded.id);
    } catch (error) {
      throw new UnauthorizedException('Refresh Token Expired');
    }
  }

  async validatePassword(existingUser: User, password: string): Promise<any> {
    if (!existingUser) {
      throw new Error('User does not exist');
    }
    const passwordValid = await argon2.verify(existingUser?.password, password);
    if (existingUser && passwordValid) {
      return true;
    }
    return false;
  }

  async signIn(
    email: string,
    password: string,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { username: string; email: string };
  } | void> {
    const user: User = await this.userService.getUserByEmail(email);
    if (user) {
      const userValid = await this.validatePassword(user, password);
      if (userValid) {
        const refreshAndAccessToken = await this.newRefreshAndAccessToken(
          user,
          values,
        );
        await this.userService.updateUser(user.userId, {
          refreshToken: refreshAndAccessToken.refreshTokenObj,
        });
        return {
          refreshToken: refreshAndAccessToken.refreshToken,
          accessToken: refreshAndAccessToken.accessToken,
          user: { username: user.username, email: user.email },
        };
      } else {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
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
    const hashedPassword = await argon2.hash(password);
    return this.userService.createUser(username, email, hashedPassword);
  }

  private async newRefreshAndAccessToken(
    user: User,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{
    accessToken: string;
    refreshTokenObj: RefreshToken;
    refreshToken: string;
  }> {
    const refreshTokenObj = new RefreshToken({
      id: uuidv4(),
      ...values,
      userId: user.userId,
    });
    this.refreshTokens.push(refreshTokenObj);
    return {
      refreshToken: refreshTokenObj.sign(),
      refreshTokenObj: refreshTokenObj,
      accessToken: sign(
        {
          userId: user.userId,
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: '1d',
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
