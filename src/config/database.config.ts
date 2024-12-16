import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGO_URI,
  dbName: process.env.DATABASE_NAME || 'blockchain_database', 
}));