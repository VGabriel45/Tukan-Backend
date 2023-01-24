import RefreshToken from 'src/auth/entities/refreshToken.entity';

export class UpdateUserDto {
  username?: string;
  refreshToken?: RefreshToken;
}
