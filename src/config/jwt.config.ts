import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secretToken: process.env.SECRET_TOKEN,
}));
