const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash, hash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = hash;
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = this.createBlock({ data: "Genesis Block", previousHash: "0" });
    this.chain.push(genesisBlock);
  }

  calculateHash(data) {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  createBlock({ data, previousHash }) {
    const index = this.chain.length;
    const timestamp = new Date();
    const blockHash = this.calculateHash({ index, timestamp, data, previousHash });
    return new Block(index, timestamp, data, previousHash, blockHash);
  }

  getLatestHash(chain) {
    if (!chain || chain.length === 0) return "0";
    return chain[chain.length - 1].hash;
  }

  isValidChain(chain) {
    if (!chain || chain.length === 0) return true; 
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];
      if (currentBlock.hash !== this.calculateHash(currentBlock)) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
    }
    return true;
  }
}

module.exports = new Blockchain();