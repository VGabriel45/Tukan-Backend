import { sign } from 'jsonwebtoken';

class RefreshToken {
  constructor(init?: Partial<RefreshToken>) {
    Object.assign(this, init);
  }

  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;

  sign(): string {
    return sign({ ...this }, process.env.REFRESH_SECRET, { expiresIn: '20s' });
  }
}

export default RefreshToken;
