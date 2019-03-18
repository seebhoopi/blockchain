/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


async function  addLevelDBBlock (key, value) {
  return new Promise(function (resolve, reject){
      db.put(key, value, function (error){
          if(error){
              reject(error);
          }
          resolve('Added block: ' + key);
          console.log('Added Block: ' + key);
      })
  })
};
    //Getting blocks data from levelDB
async function getLevelBlock (key){
      return new Promise(function (resolve, reject){
          db.get(key, function (error, value){
              if(error)
                  reject(error);
              resolve(JSON.parse(value));
          })
      })
  };
//Getting blockchain height from levelDB
async function  getLevelBlockHeight(){
  return new Promise(function(resolve, reject){
      let height = -1;
      db.createReadStream()
          .on('data', function (data){
              height++;
          })
          .on('error', function (error){
              reject(error);
          })
          .on('close', function (){
              resolve(height);
          })
  })
};

  // Add data to levelDB with key/value pair
    function addLevelDBData(key,value){
      db.put(key, value, function(err) {
        if (err) return console.log('Block ' + key + ' submission failed', err)
        else 
          return value;
      })
   }

    // Get data from levelDB with key
    function  getLevelDBData(key){
      db.get(key, function(err, value) {
        if (err) return console.log('Not found!', err);
        console.log('Value = ' + value);
      })
    }

    // Add data to levelDB with value
    function  addDataToLevelDB(value) {
        let i = 0;
        return new Promise(function(resolve, reject){
        db.createReadStream().on('data', function(data) {

              i++;
            }).on('error', function(err) {
              reject(err);
            }).on('close', function() {
               addLevelDBData(i, value);
               resolve(true);
            });
          });
    }

    function  getBlockHeightLevelDB()
    {
      let dataArray = [];
      return new Promise(function(resolve, reject){
          db.createKeyStream()
          .on('data', function (data) {
            dataArray.push(data);
          })
          .on('error', function (err) {
            reject(err)
          })
          .on('close', function () {
            resolve(dataArray.length);
          });
        });
    }


    function  getAllLevelDBData(){
      return new Promise(function(resolve, reject){
      db.createReadStream()
      .on('data', function (data) {
        console.log(data.key, data)
      })
      .on('error', function (err) {
        console.log('Oh my!', err)
      })
      .on('close', function () {
        console.log('Stream closed getAllLevelDBData')
      })
      .on('end', function () {
        console.log('Stream ended getAllLevelDBData')
      })
    });
  }

    function getLevelBlockByHash (hash) {
      let block;
      return new Promise((resolve, reject) => {
          db.createReadStream().on('data', (data) => {
              block = JSON.parse(data.value);
              if (block.hash === hash) {
                  // Check if the block is not a Genesis Block
                  if (parseInt(data.key) !== 0) {
                      block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                      return resolve(block)
                  } else {
                      return resolve(block)
                  }
              }
          }).on('error', (error) => {
              return reject(error)
          }).on('close', () => {
              return reject('Not found')
          })
      })
  }

  // Get Blocks data from LevelDb by Address request.
  function getLevelBlocksByAddress (address) {
      const blocks = [];
      let block;
      return new Promise((resolve, reject) => {
          db.createReadStream().on('data', (data) => {
              // Check if the block is not a Genesis Block
              if (parseInt(data.key) !== 0) {
                  block = JSON.parse(data.value);
                  // Check if block address matches with the requested address.
                  if (block.body.address === address) {
                      block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
                      blocks.push(block)
                  }
              }
          }).on('error', (error) => {
              return reject(error)
          }).on('close', () => {
              return resolve(blocks)
          })
      })
  }


module.exports.addDataToLevelDB = addDataToLevelDB;
module.exports.getAllLevelDBData = getAllLevelDBData;
module.exports.getLevelBlocksByAddress = getLevelBlocksByAddress;
module.exports.getLevelBlockByHash = getLevelBlockByHash;
module.exports.addLevelDBBlock = addLevelDBBlock;
module.exports.getLevelBlockHeight = getLevelBlockHeight;
module.exports.getLevelBlock = getLevelBlock;
 