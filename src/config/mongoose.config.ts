import { registerAs } from '@nestjs/config';

export default registerAs('mongoose', () => ({
  uri: process.env.DATABASE_URL,
}));
