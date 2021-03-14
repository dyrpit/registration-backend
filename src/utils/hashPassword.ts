import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

export const hashPassword = (password: string): string => {
  if (!password) return password;

  const hmac = crypto.createHmac('sha512', process.env.SHA512_HASH);

  hmac.update(password);

  return hmac.digest('hex');
};
