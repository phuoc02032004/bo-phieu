import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types} from 'mongoose';
import { Election, ElectionDocument } from './elections.schema';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { BlockchainService } from '../block/blockchain.service';
import { UsersService } from '../users/users.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { UserDocument } from 'src/users/users.schema';
import mongoose from 'mongoose';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectModel(Election.name) private electionModel: Model<ElectionDocument>,
    private readonly blockchainService: BlockchainService,
    private readonly usersService: UsersService,
  ) {}

  async create(createElectionDto: CreateElectionDto): Promise<ElectionDocument> {
    const newElection = await this.electionModel.create(createElectionDto);
    return newElection;
  }

  async findAll(): Promise<ElectionDocument[]> {
    return this.electionModel.find().populate('creatorId').populate('candidates.candidate').exec();
  }

  async findOne(id: string): Promise<ElectionDocument> {
    const election = await this.electionModel
      .findById(id)
      .select('participants') 
      .populate('participants', '_id name email') 
      .exec();

    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }
    return election;
  }

  async update(id: string, updateElectionDto: UpdateElectionDto): Promise<ElectionDocument> {
    const election = await this.electionModel.findByIdAndUpdate(id, updateElectionDto, { new: true }).populate('creatorId').populate('candidates.candidate').exec();
    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }
    return election;
  }

  async remove(id: string): Promise<void> {
    const election = await this.electionModel.findByIdAndDelete(id).exec();
    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }
  }

  async hasUserVoted(electionId: mongoose.Types.ObjectId, voterId: mongoose.Types.ObjectId): Promise<boolean> {
    const election = await this.electionModel.findById(electionId).exec();
    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }
    return election.voters.includes(voterId);
  }

  async castVote(
    electionId: Types.ObjectId,
    voterId: Types.ObjectId,
    candidateId: Types.ObjectId,
  ): Promise<ElectionDocument> {

    try {
      const election = await this.electionModel.findById(electionId).populate('candidates.candidate').exec();
      if (!election) {
        throw new NotFoundException('Election not found.');
      }
      const user = await this.usersService.findOne(voterId);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      if (!user.participatedElections.some(id => id.equals(electionId))) {
        throw new BadRequestException('User has not joined this election.');
      }
      if (election.voters.some(v => v.equals(voterId))) {
        throw new BadRequestException('Voter has already cast a vote.');
      }
      const candidateIndex = election.candidates.findIndex(c => c.candidate.equals(candidateId));
      if (candidateIndex === -1) {
        throw new NotFoundException('Candidate not found in this election.');
      }
      election.candidates[candidateIndex].votes++;
      election.voters.push(voterId);
      const updatedElection = await election.save();
      await this.blockchainService.addVoteToBlockchain(electionId, voterId, candidateId);

      return updatedElection;
    } catch (error) {
      console.error('Error in castVote service:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred during voting.');
    }
  }

  async addCandidate(electionId: string, candidateId: string): Promise<ElectionDocument> {
    return this.blockchainService.addCandidate(electionId, candidateId);
  }

  async updateCandidate(electionId: string, candidateId: string, updateCandidateDto: UpdateCandidateDto): Promise<ElectionDocument> {
    return this.blockchainService.updateCandidate(electionId, candidateId, updateCandidateDto);
  }

  async deleteCandidate(electionId: string, candidateId: string): Promise<ElectionDocument> {
    return this.blockchainService.deleteCandidate(electionId, candidateId);
  }

  async joinElection(userId: string, electionId: string): Promise<ElectionDocument> {
    const userIdObject = new mongoose.Types.ObjectId(userId);
    const electionIdObject = new mongoose.Types.ObjectId(electionId);

    const election = await this.electionModel.findById(electionIdObject);

    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }

    if (election.participants.includes(userIdObject)) {
      throw new BadRequestException("Bạn đã tham gia cuộc bầu cử này rồi!");
    }

    election.participants.push(userIdObject);
    await election.save();

    const user = await this.usersService.findOne(userIdObject);
    user.participatedElections.push(new Types.ObjectId(electionId)); 
    await user.save();

    return election;
  }  
}