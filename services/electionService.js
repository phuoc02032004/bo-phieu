const Election = require("../models/Election");
const Block = require("../models/Block"); 
const User = require("../models/User");  
const Blockchain = require('../utils/blockchain');
const mongoose = require('mongoose');
const fs = require('node:fs/promises');
const path = require('path');

let blockchainInstance = null;

const createElection = async (electionData) => {
  try {
    const election = new Election(electionData);
    await election.save();
    return election;
  } catch (error) {
    throw new Error("Lỗi khi tạo cuộc bầu cử: " + error.message);
  }
};

const getAllElections = async () => {
  return Election.find().populate("creatorId").populate("candidates.candidate");
};

const getElectionById = async (electionId) => {
  return Election.findById(electionId)
    .populate("creatorId")
    .populate("candidates.candidate");
};

const getBlockchainInstance = async () => {
    const filePath = path.resolve(__dirname, '..', 'blockchain.json');
    if (!blockchainInstance) {
        try {
            blockchainInstance = new Blockchain(filePath);
            await blockchainInstance.loadBlockchain();
            console.log(`Blockchain instance initialized with file path: ${filePath}`);
        } catch (error) {
            console.error('Error initializing blockchain:', error);
            blockchainInstance = new Blockchain(filePath);
            await blockchainInstance.createGenesisBlock();
        }
    }
    return blockchainInstance;
};

const castVote = async (voteData) => {
    const { electionId, candidateId, voterId } = voteData;
    console.log("\n--- Starting castVote ---");
    console.log("Casting vote:", { electionId, candidateId, voterId });

    try {
        const user = await User.findById(voterId);
        const election = await Election.findById(electionId)
            .populate('candidates.candidate')
            .populate('creatorId');

        if (!election) {
            throw new Error('Election not found.');
        }
        if (!user) {
            throw new Error('User not found.');
        }

        if (!user.participatedElections.includes(electionId)) {
          throw new Error('Bạn chưa tham gia cuộc bầu cử này.');
        }

        if (election.voters && election.voters.includes(voterId)) {
            throw new Error('Voter has already cast a vote.');
        }

        const candidate = election.candidates.find(c => c.candidate._id.equals(candidateId));
        if (!candidate) {
            throw new Error('Candidate not found.');
        }

        candidate.votes++;
        election.voters.push(voterId);
        await election.save();

        await user.save();

        const blockchain = await getBlockchainInstance(); 
        const latestBlock = await blockchain.getLatestBlock();
        const previousHash = latestBlock ? latestBlock.hash : '0';
        const newIndex = (latestBlock ? latestBlock.index : 0) + 1;

        const newBlockData = { electionId, voterId, candidateId, timestamp: new Date() };
        const newBlock = blockchain.createBlock(newBlockData, previousHash, newIndex);

        await new Block(newBlock).save();


        return election;
    } catch (error) {
        console.error('\n--- Error casting vote ---', error);
        throw error;
    }
};

const addCandidate = async (electionId, candidateId) => {
    try {
      console.log('electionId:', electionId);
      const election = await Election.findById(electionId);
      console.log('election:', election);
      if (!election) {
        console.log('Election not found!');
        throw new Error("Cuộc bầu cử không tồn tại.");
      }  
      const existingCandidate = election.candidates.find(c => c.candidate.equals(candidateId));
      if (existingCandidate) {
        throw new Error("Ứng viên này đã được thêm vào cuộc bầu cử.");
      }
  
      election.candidates.push({ candidate: candidateId, votes: 0 });
      await election.save();
      return election;
    } catch (error) {
      throw new Error("Lỗi khi thêm ứng viên: " + error.message);
    }
  };

const updateCandidate = async (electionId, candidateId, updatedData) => {
    try {
      const election = await Election.findById(electionId);
      if (!election) {
        throw new Error("Cuộc bầu cử không tồn tại.");
      }
  
      const candidateIndex = election.candidates.findIndex(c => c.candidate.equals(candidateId));
      if (candidateIndex === -1) {
        throw new Error("Ứng viên không tồn tại trong cuộc bầu cử này.");
      }
  
      election.candidates[candidateIndex] = { ...election.candidates[candidateIndex], ...updatedData };
      await election.save();
      return election;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật ứng viên: " + error.message);
    }
  };
  
  
  const deleteCandidate = async (electionId, candidateId) => {
    try {
      const election = await Election.findById(electionId);
      if (!election) {
        throw new Error("Cuộc bầu cử không tồn tại.");
      }
  
      election.candidates = election.candidates.filter(c => !c.candidate.equals(candidateId));
      await election.save();
      return election;
    } catch (error) {
      throw new Error("Lỗi khi xóa ứng viên: " + error.message);
    }
  };
  
  const joinElection = async (userId, electionId) => {
    try {
      // Kiểm tra đầu vào: userId và electionId không được null hoặc undefined
      if (!userId || !electionId) {
        throw new Error("userId và electionId không được bỏ trống.");
      }
  
      // Chuyển đổi userId và electionId thành ObjectId nếu cần
      console.log(userId)
      const userIdObject = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      const electionIdObject = typeof electionId === 'string' ? new mongoose.Types.ObjectId(electionId) : electionId;
  
      const user = await User.findById(userIdObject);
      const election = await Election.findById(electionIdObject);
  
      if (!user) {
        throw new Error("Người dùng không tồn tại.");
      }
      if (!election) {
        throw new Error("Cuộc bầu cử không tồn tại.");
      }
  
      // Kiểm tra xem người dùng đã tham gia cuộc bầu cử này chưa
      if (user.participatedElections.includes(electionIdObject)) {
        throw new Error("Bạn đã tham gia cuộc bầu cử này rồi!");
      }
  
      user.participatedElections.push(electionIdObject);
      await user.save();
  
      return user; // Trả về user đã được cập nhật
    } catch (error) {
      console.error("Error in joinElection:", error); // Log lỗi chi tiết
      throw new Error("Lỗi khi tham gia cuộc bầu cử: " + error.message);
    }
  };

module.exports = {
  createElection,
  getAllElections,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  getElectionById,
  castVote,
  joinElection
};