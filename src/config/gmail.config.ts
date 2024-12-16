import { registerAs } from '@nestjs/config';

export default registerAs('gmail', () => ({
  user: process.env.GMAIL_USER,
  password: process.env.GMAIL_PASSWORD,
}));