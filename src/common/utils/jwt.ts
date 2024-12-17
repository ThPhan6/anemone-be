import * as jwt from 'jsonwebtoken';

export const signData = (
  payload: string | { [key: string]: any } | Buffer,
  expiresIn?: string,
): string => {
  return jwt.sign(payload, 'privateKey', {
    expiresIn: expiresIn || process.env.ACCESS_TOKEN_DURATION || '1h',
    algorithm: 'RS256',
  });
};

export const verifyData = <T>(token: string): T => {
  return jwt.verify(token, 'privateKey', { algorithms: ['RS256'] }) as T;
};
