const crypto = require('crypto');
const Block = require('../models/Block'); // Import your Block model
const mongoose = require('mongoose');

class Blockchain {
    constructor(filePath) {
        //filePath không cần thiết nữa vì chúng ta lưu vào database
    }

    async createGenesisBlock() {
        const genesisBlock = this.createBlock({ data: 'Genesis Block', previousHash: '0' }, 0);
        await new Block(genesisBlock).save();
        console.log('Genesis block created successfully.');
    }

    calculateHash(blockData) {
        const blockString = JSON.stringify(blockData, Object.keys(blockData).sort());
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    createBlock(blockData, previousHash, index) {
      const newBlock = {
          index,
          timestamp: new Date(),
          data: blockData,
          previousHash,
          hash: this.calculateHash({...blockData, previousHash, index}),
          electionId: blockData.electionId, // Thêm các trường cần thiết
          voterId: blockData.voterId,
          candidateId: blockData.candidateId,
      };
      return newBlock;
  }

    async getLatestBlock() {
        const latestBlock = await Block.findOne({}, {}, { sort: { index: -1 } });
        return latestBlock;
    }

    async addBlock(newBlock) {
        await new Block(newBlock).save();
        console.log('Block added to blockchain:', newBlock);
    }

    async loadBlockchain() {
        try {
            this.chain = await Block.find({}).sort({ index: 1 });
            console.log('Blockchain loaded from database.');
        } catch (error) {
            console.error('Error loading blockchain:', error);
            if (error.name === 'CastError'){
                //Tạo genesis block nếu database bị lỗi
                console.log('Creating genesis block...');
                this.createGenesisBlock();
            } else {
                throw error;
            }
        }
    }


    async saveBlockchain() {
        //Không cần thiết nữa vì chúng ta đã save từng block
    }
}

module.exports = Blockchain;