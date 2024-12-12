const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    index: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    data: { type: Object, required: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    voterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Block', blockSchema);