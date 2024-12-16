import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe, Request, UnauthorizedException } from '@nestjs/common';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CastVoteDto } from './dto/cast-vote.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import mongoose, { Types } from 'mongoose';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  create(@Body() createElectionDto: CreateElectionDto, @Request() req: any) {
      const creatorId = req.user?._id;
      if (!creatorId) {
          throw new UnauthorizedException('User not authenticated.');
      }
      return this.electionsService.create({ ...createElectionDto, creatorId }); 
  }

  @Get()
  findAll() {
    return this.electionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.electionsService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateElectionDto: UpdateElectionDto) {
    return this.electionsService.update(id, updateElectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.electionsService.remove(id);
  }

  @Post(':id/cast-vote')
  @UseGuards(JwtAuthGuard)
  async castVote(
    @Param('id') electionId: string,
    @Request() req: { user: JwtPayload },
    @Body('candidateId') candidateId: string,
  ) {
    const voterId = req.user.id;
    if (!voterId) {
      throw new UnauthorizedException('User not authenticated.');
    }

    try {
      const updatedElection = await this.electionsService.castVote(
        new Types.ObjectId(electionId),        // Pass as ObjectId
        new Types.ObjectId(voterId),          // Pass as ObjectId
        new Types.ObjectId(candidateId),     // Pass as ObjectId
      );

      return updatedElection;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error; // Re-throw specific exceptions
      } else {
        console.error('Error casting vote:', error);
        throw new InternalServerErrorException('Failed to cast vote.');
      }
    }
  }



  @Post(':electionId/candidates/:candidateId')
  addCandidate(@Param('electionId') electionId: string, @Param('candidateId') candidateId: string) {
    return this.electionsService.addCandidate(electionId, candidateId);
  }

  @Put(':electionId/candidates/:candidateId')
  @UsePipes(new ValidationPipe())
  updateCandidate(
    @Param('electionId') electionId: string,
    @Param('candidateId') candidateId: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.electionsService.updateCandidate(electionId, candidateId, updateCandidateDto);
  }

  @Delete(':electionId/candidates/:candidateId')
  deleteCandidate(
    @Param('electionId') electionId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.electionsService.deleteCandidate(electionId, candidateId);
  }

  @Post(':electionId/join') 
  @UseGuards(JwtAuthGuard)
  async joinElection(
    @Param('electionId') electionId: string,
    @Request() req: { user: JwtPayload },
  ) {
    const userId = req.user.id; 
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }


    try {
      const user = await this.electionsService.joinElection(userId, electionId);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error.message === "Bạn đã tham gia cuộc bầu cử này rồi!") {
        throw new BadRequestException("Bạn đã tham gia cuộc bầu cử này rồi!"); 
      } else {
        throw new InternalServerErrorException('An error occurred during joining the election.');  
      }

    }
  }
  @Get(':electionId/participants')
  async getParticipants(@Param('electionId') electionId: string) {
    try {
      const election = await this.electionsService.findOne(electionId); 
      if (!election) {
        throw new NotFoundException(`Election with ID ${electionId} not found`);
      }
      return election.participants;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; 
      } else {
        throw new InternalServerErrorException("Error retrieving participants");
      }
    }
  }

}