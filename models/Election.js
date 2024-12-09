const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    candidates: [
      {
        candidate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Tham chiếu tới User
          required: true,
        },
        votes: {
          type: Number,
          default: 0,
        },
      },
    ],
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    blockchainData: [
      {
        blockHash: {
          type: String,
          required: true,
        },
        previousHash: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        voterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Tham chiếu tới User
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const Election = mongoose.model("Election", electionSchema);
  module.exports = Election;
  