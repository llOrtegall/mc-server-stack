import jwt from 'jsonwebtoken';
import { config } from '../../../config.js';
import type {
  TokenPayload,
  TokenRepository,
} from '../domain/TokenRepository.js';

export class JwtTokenRepository implements TokenRepository {
  sign(adminId: string): string {
    return jwt.sign({ id: adminId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  }
}
