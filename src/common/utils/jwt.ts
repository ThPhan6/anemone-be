import * as jwt from 'jsonwebtoken';

export const signData = (payload: string | { [key: string]: any } | Buffer): string => {
  return jwt.sign(payload, 'privateKey', {
    algorithm: 'RS256',
  });
};

export const verifyData = <T>(token: string): T => {
  return jwt.verify(token, 'privateKey', { algorithms: ['RS256'] }) as T;
};
