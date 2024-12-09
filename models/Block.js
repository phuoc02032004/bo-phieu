const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
    default: Date.now,
  },
  index: {
    type: Number,
    required: true,
  },
});

const Block = mongoose.model('Block', blockSchema);
module.exports = Block;
