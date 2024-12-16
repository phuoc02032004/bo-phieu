import { Module } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Election, ElectionSchema } from './elections.schema';
import { Block, BlockSchema } from '../block/blocks.schema';
import { UsersModule } from '../users/users.module';
import { BlockchainService } from '../block/blockchain.service';
import { UtilsModule } from 'src/utils/utils.module';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from '../users/users.schema'; 


@Module({
    imports: [
      MongooseModule.forFeature([{ name: Election.name, schema: ElectionSchema }]),
      MongooseModule.forFeature([{ name: Block.name, schema: BlockSchema }]),
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),  
      UsersModule, 
      UtilsModule,
      AuthModule,
    ],
    controllers: [ElectionsController],
    providers: [ElectionsService, BlockchainService], 
    exports: [ElectionsService],
  })
  export class ElectionsModule {}