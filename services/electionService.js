const Election = require("../models/Election");
const Block = require("../models/Block");   
const Blockchain = require("../utils/blockchain");
const mongoose = require('mongoose');

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
    console.log("\n--- Starting castVote ---");
    console.log("Casting vote:", { electionId, candidateId, voterId });

    // Kiểm tra đầu vào và kiểu dữ liệu
    if (!electionId || !candidateId || !voterId) {
        throw new Error("electionId, candidateId, and voterId are required.");
    }

    if (!mongoose.Types.ObjectId.isValid(electionId) || 
        !mongoose.Types.ObjectId.isValid(candidateId) ||
        !mongoose.Types.ObjectId.isValid(voterId)) {
        throw new Error("Invalid ObjectId provided.");
    }

    try {
        const election = await Election.findById(electionId)
            .populate("candidates.candidate")
            .populate("creatorId");

        if (!election) {
            throw new Error("Election not found.");
        }

        if (!election.candidates || !Array.isArray(election.candidates)) {
            throw new Error("Invalid candidate data.");
        }

        const now = new Date();
        console.log("\n--- Time check ---");
        console.log("Current time:", now);
        console.log("Start time:", election.startTime);
        console.log("End time:", election.endTime);

        // Kiểm tra thời gian bầu cử
        if (now < election.startTime || now > election.endTime) {
            throw new Error("Election is not currently active.");
        }

        // Kiểm tra xem voter đã bỏ phiếu chưa
        if (election.voters && election.voters.includes(voterId)) {
            throw new Error("Voter has already cast a vote.");
        }

        // Tìm ứng cử viên trong danh sách
        const candidate = election.candidates.find((c) => c.candidate._id.equals(candidateId));
        if (!candidate) {
            throw new Error("Candidate not found.");
        }

        console.log("\n--- Updating vote count ---");
        candidate.votes++;
        if (!election.voters) {
            election.voters = [];
        }
        election.voters.push(voterId);  // Thêm voterId vào danh sách đã bỏ phiếu

        // Kiểm tra và khởi tạo blockchainData nếu chưa tồn tại
        if (!election.blockchainData) {
            election.blockchainData = [];
        }

        // Tạo block mới cho cuộc bầu cử
        const previousBlock = election.blockchainData[election.blockchainData.length - 1];
        const previousHash = previousBlock ? previousBlock.blockHash : '0'; // Nếu không có block nào, đặt previousHash là '0'
        const newIndex = election.blockchainData.length + 1;  // Đảm bảo index tăng dần

        console.log("\n--- Creating block ---");
        console.log("Previous Hash:", previousHash);
        console.log("New Index:", newIndex);

        try {
            // Tạo block mới
            const newBlock = Blockchain.createBlock({
                data: { electionId, voterId, candidateId },
                previousHash,
                index: newIndex
            });

            // Kiểm tra tính hợp lệ của block
            if (!newBlock || !newBlock.hash) {
                throw new Error("Lỗi tạo block trên blockchain: blockHash không hợp lệ.");
            }

            // Tạo đối tượng Block mới và lưu vào MongoDB
            const block = new Block({
                electionId,
                voterId,
                candidateId,
                blockHash: newBlock.hash,
                previousHash: newBlock.previousHash,
                index: newBlock.index
            });

            await block.save();  // Lưu block vào MongoDB

            // Thêm block vào blockchain của cuộc bầu cử
            election.blockchainData.push(newBlock);
            console.log("blockchainData after push:", election.blockchainData);

            // Lưu cuộc bầu cử với block mới
            const savedElection = await election.save();
            console.log("\n--- Election saved successfully ---");
            console.log(savedElection);

            return savedElection;
        } catch (blockError) {
            console.error("\n--- Error creating block ---\n", blockError);
            throw new Error("Lỗi tạo block trên blockchain: " + blockError.message);
        }
    } catch (error) {
        console.error("\n--- Error casting vote ---");
        console.error(error);
        throw error;
    }
};


module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  castVote,
};