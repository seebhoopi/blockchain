/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/
const levelSandBox = require('./levelSandbox');

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}
/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
class Blockchain{
  constructor(){
    //Get block height from levelDB
        this.getBlockHeight().then(height => {
          //Check if block height is 0
          console.log('Height of Blockchain: ' + height);
          if (height === -1) {
              //Create the Genesis Block - The first block in the blockchain
              this.addBlock(
                  new Block('First block in the chain - Genesis block')
              ).then(() => console.log('Genesis Block created!'));
          }
      });

  }

  // Add new block
  async addBlock(newBlock){
    //Get block height from levelDB
    const height = await this.getBlockHeight();
    newBlock.height = height + 1;
    //Generate block timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    //Check if the Block is not Genesis Block
    if (newBlock.height > 0) {
        //Get the block
        const prevBlock = await this.getBlock(height.toString());
        //Get previous block's hash
        newBlock.previousBlockHash = prevBlock.hash;
        console.log('Previous Hash: ' + newBlock.previousBlockHash)
    }
    //Generate hash for the new block.
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    console.log('Next Hash: ' + newBlock.hash);
    //Save the block created to levelDB
    await levelSandBox.addLevelDBBlock(newBlock.height.toString(), JSON.stringify(newBlock))
};

   // Get block height
    async getBlockHeight(){
      return await levelSandBox.getLevelBlockHeight();
    }

    // get block
    async getBlock(blockHeight){
      // return object as a single string
      return await levelSandBox.getLevelBlock(blockHeight);
    }

    // get block
    async getAllLevelDBData(){
      // return object as a single string
      return await levelSandBox.getAllLevelDBData();
    }

    

    // validate block
    async validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
   async validateChain(){
      let errorLog = [];
      for (let i = 0; i < this.chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.chain[i].hash;
        let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }

     // Get block data by hash
  async getBlockByHash(hash){
      //Return block data by hash value from levelDB
      return await levelSandBox.getLevelBlockByHash(hash);
  };

  // Get blocks data by address
  async getBlocksByAddress(address){
      //Return blocks data by address from levelDB
      return await levelSandBox.getLevelBlocksByAddress(address);
  };
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;

