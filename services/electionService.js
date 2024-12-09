const Election = require("../models/Election");
const Blockchain = require("../utils/blockchain"); // Giả sử module Blockchain tồn tại

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

const castVote = async ({ electionId, candidateId, voterId }) => {
    console.log("Casting vote:", { electionId, candidateId, voterId });
  
    if (!electionId || !candidateId || !voterId) {
      throw new Error("electionId, candidateId, and voterId are required.");
    }
  
    try {
      const election = await Election.findById(electionId)
        .populate("candidates.candidate")
        .populate("creatorId");
  
      if (!election) {
        throw new Error("Cuộc bầu cử không tồn tại.");
      }
  
      if (!election.candidates || !Array.isArray(election.candidates)) {
        throw new Error("Dữ liệu ứng viên không hợp lệ.");
      }
  
      const now = new Date();
      if (now < election.startTime || now > election.endTime) {
        throw new Error("Cuộc bầu cử đã kết thúc hoặc chưa bắt đầu.");
      }
  
      if (election.voters.includes(voterId)) {
        throw new Error("Bạn đã bỏ phiếu trong cuộc bầu cử này.");
      }
  
      const candidate = election.candidates.find((c) =>
        c.candidate._id.equals(candidateId)
      );
  
      if (!candidate) {
        throw new Error("Ứng viên không tồn tại.");
      }
  
      candidate.votes += 1;
      election.voters.push(voterId);
  
      const previousHash = Blockchain.getLatestHash(election.blockchainData);
      const newBlock = await Blockchain.createBlock({
        electionId,
        voterId,
        candidateId,
        previousHash,
      });
  
      if (!newBlock || !newBlock.blockHash) {
        throw new Error("Lỗi tạo block trên blockchain.");
      }
  
      election.blockchainData.push(newBlock);
  
      const savedElection = await election.save();
      console.log("Vote cast successfully:", savedElection);
      return savedElection;
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  };

module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  castVote,
};