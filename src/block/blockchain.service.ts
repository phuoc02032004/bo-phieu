import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'; // Import necessary exceptions
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; 
import { Block, BlockDocument } from './blocks.schema';
import { CryptoService } from './crypto.service';
import { Election, ElectionDocument } from '../elections/elections.schema';
import { UsersService } from '../users/users.service';
import { CastVoteDto } from '../elections/dto/cast-vote.dto';
import { UpdateCandidateDto } from '../elections/dto/update-candidate.dto';
import mongoose from 'mongoose';

interface BlockData {
  electionId: Types.ObjectId;
  voterId: Types.ObjectId;
  candidateId: Types.ObjectId;
  timestamp: Date;
}

@Injectable()
export class BlockchainService {
  constructor(
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    private cryptoService: CryptoService,
    private usersService: UsersService,
    @InjectModel(Election.name) private electionModel: Model<ElectionDocument>,
  ) {}

  async createGenesisBlock(): Promise<BlockDocument> {
    const genesisBlock = this.createBlock({ data: 'Genesis Block', previousHash: '0' }, '0', 0);
    return this.blockModel.create(genesisBlock);
  }

  calculateHash(blockData: any): string {
    const blockString = JSON.stringify(blockData, Object.keys(blockData).sort());
    return this.cryptoService.createHash(blockString);
  }

  createBlock(blockData: any, previousHash: string, index: number): Block {
    const newBlock: Block = {
      index,
      timestamp: new Date(),
      data: {
        electionId: new mongoose.Types.ObjectId(blockData.electionId),
        voterId: new mongoose.Types.ObjectId(blockData.voterId),
        candidateId: new mongoose.Types.ObjectId(blockData.candidateId),
        timestamp: new Date(),
      },
      previousHash,
      hash: this.calculateHash({ ...blockData, previousHash, index }),
      electionId: new mongoose.Types.ObjectId(blockData.electionId),
      voterId: new mongoose.Types.ObjectId(blockData.voterId),
      candidateId: new mongoose.Types.ObjectId(blockData.candidateId),
    };
    return newBlock;
  }

  async getLatestBlock(): Promise<BlockDocument | null> {
    return this.blockModel.findOne().sort({ index: -1 }).exec();
  }

  async addBlock(newBlock: Block): Promise<BlockDocument> {
    return this.blockModel.create(newBlock);
  }

  async loadBlockchain(): Promise<BlockDocument[]> {
    try {
      const blocks = await this.blockModel.find({}).sort({ index: 1 }).exec();
      console.log('Blockchain loaded from database.');
      return blocks;
    } catch (error) {
      console.error('Error loading blockchain:', error);
      if (error.name === 'CastError') {
        console.log('Creating genesis block...');
        const genesisBlock = await this.createGenesisBlock();
        return [genesisBlock];
      } else {
        throw error;
      }
    }
  }

  async addVoteToBlockchain(
    electionId: Types.ObjectId,
    voterId: Types.ObjectId,
    candidateId: Types.ObjectId,
  ): Promise<BlockDocument> {
    try {
      console.log('Adding vote to blockchain:', { electionId, voterId, candidateId });

      const latestBlock = await this.getLatestBlock();
      const previousHash = latestBlock ? latestBlock.hash : '0';
      const newIndex = (latestBlock ? latestBlock.index : 0) + 1;

      const newBlockData: BlockData = {
        electionId,
        voterId,
        candidateId,
        timestamp: new Date(),
      };

      const newBlock = this.createBlock(newBlockData, previousHash, newIndex);
      const savedBlock = await this.addBlock(newBlock);
      console.log('Block added to blockchain successfully:', savedBlock);
      return savedBlock;
    } catch (error) {
      console.error('Error adding vote to blockchain:', error);
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid block data.');
      }
      throw new InternalServerErrorException('Failed to add vote to blockchain.');
    }
  }

  async addCandidate(electionId: string, candidateId: string): Promise<ElectionDocument> {
    const electionIdObject = new mongoose.Types.ObjectId(electionId);
    const election = await this.electionModel.findById(electionIdObject).exec();
    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }
    const existingCandidate = election.candidates.find(c => c.candidate.toString() === candidateId);
    if (existingCandidate) {
      throw new Error("Ứng viên này đã được thêm vào cuộc bầu cử.");
    }

    election.candidates.push({ candidate: new mongoose.Types.ObjectId(candidateId), votes: 0 });
    await election.save();
    return election;
  }

  async updateCandidate(electionId: string, candidateId: string, updateCandidateDto: UpdateCandidateDto): Promise<ElectionDocument> {
    const electionIdObject = new mongoose.Types.ObjectId(electionId);
    const election = await this.electionModel.findById(electionIdObject).exec();
    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }

    const candidateIndex = election.candidates.findIndex(c => c.candidate.toString() === candidateId);
    if (candidateIndex === -1) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found in election ${electionId}`);
    }

    election.candidates[candidateIndex] = { ...election.candidates[candidateIndex], ...updateCandidateDto };
    await election.save();
    return election;
  }

  async deleteCandidate(electionId: string, candidateId: string): Promise<ElectionDocument> {
    const electionIdObject = new mongoose.Types.ObjectId(electionId);
    const election = await this.electionModel.findById(electionIdObject).exec();
    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }

    election.candidates = election.candidates.filter(c => c.candidate.toString() !== candidateId);
    await election.save();
    return election;
  }
}