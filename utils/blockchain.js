const crypto = require("crypto");

class Blockchain {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  // Tạo khối gốc
  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      data: "Genesis Block",
      previousHash: "0",
      hash: this.calculateHash(0, new Date().toISOString(), "Genesis Block", "0"),
    };
    this.chain.push(genesisBlock);
  }

  // Tính toán hàm băm
  calculateHash(index, timestamp, data, previousHash) {
    return crypto
      .createHash("sha256")
      .update(index + timestamp + JSON.stringify(data) + previousHash)
      .digest("hex");
  }

  // Tạo khối mới
  createBlock({ voterId, candidateId, previousHash }) {
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const data = { voterId, candidateId };

    const hash = this.calculateHash(index, timestamp, data, previousHash);

    return {
      index,
      timestamp,
      data,
      previousHash,
      hash,
    };
  }

  // Lấy hàm băm mới nhất từ blockchain
  getLatestHash(chain) {
    if (chain.length === 0) {
      return this.chain[this.chain.length - 1].hash;
    }
    return chain[chain.length - 1].hash;
  }

  // Kiểm tra tính toàn vẹn của blockchain
  isValidChain(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      // Kiểm tra hash của khối hiện tại
      if (
        currentBlock.hash !==
        this.calculateHash(
          currentBlock.index,
          currentBlock.timestamp,
          currentBlock.data,
          currentBlock.previousHash
        )
      ) {
        return false;
      }

      // Kiểm tra liên kết hash của khối trước đó
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports = new Blockchain();
