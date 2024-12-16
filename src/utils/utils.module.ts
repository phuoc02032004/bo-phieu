import { Module } from '@nestjs/common';
import { CryptoService } from '../block/crypto.service';
import { BlockchainService } from '../block/blockchain.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from '../block/blocks.schema';
import { Election, ElectionSchema } from '../elections/elections.schema';
import { UsersModule } from 'src/users/users.module'; 

@Module({
    imports: [
      MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
      MongooseModule.forFeature([{ name: Election.name, schema: ElectionSchema }]),
      UsersModule,
    ],
    providers: [CryptoService, BlockchainService],
    exports: [BlockchainService, CryptoService],
  })
  export class UtilsModule {}