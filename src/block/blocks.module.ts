import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { BlockchainService } from './blockchain.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from './blocks.schema';
import { UsersModule } from '../users/users.module';
import { Election, ElectionSchema } from '../elections/elections.schema';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
    MongooseModule.forFeature([{ name: Election.name, schema: ElectionSchema }]),
    UsersModule,
  ],
  providers: [CryptoService, BlockchainService, UsersService],
  exports: [BlockchainService],
})
export class UtilsModule {}