import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  createHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}