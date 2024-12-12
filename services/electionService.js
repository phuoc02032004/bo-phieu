const Election = require("../models/Election");
const Block = require("../models/Block");   
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

    // Input validation (giữ nguyên)

    try {
        const election = await Election.findById(electionId)
            .populate('candidates.candidate')
            .populate('creatorId');

        if (!election) {
            throw new Error('Election not found.');
        }

        // Check election time (giữ nguyên)

        if (election.voters && election.voters.includes(voterId)) {
            throw new Error('Voter has already cast a vote.');
        }

        const candidate = election.candidates.find(c => c.candidate._id.equals(candidateId));
        if (!candidate) {
            throw new Error('Candidate not found.');
        }

        candidate.votes++;
        election.voters.push(voterId);

        // Get blockchain instance (giữ nguyên)
        const blockchain = new Blockchain(); //Khởi tạo blockchain ở đây
        await blockchain.loadBlockchain(); //Load blockchain từ database
        const latestBlock = await blockchain.getLatestBlock();
        const previousHash = latestBlock ? latestBlock.hash : '0';
        const newIndex = (latestBlock ? latestBlock.index : 0) + 1;

        const newBlockData = { electionId, voterId, candidateId, timestamp: new Date() };
        const newBlock = blockchain.createBlock(newBlockData, previousHash, newIndex);

        // Save the new block
        await new Block(newBlock).save();

        // Save the updated election
        await election.save();

        return election;
    } catch (error) {
        console.error('\n--- Error casting vote ---', error);
        throw error;
    }
};


module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  castVote,
};