const simpleChain = require('./simpleChain');
const validateReference = require('./validation');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const port = 8000
let myBlockChain = new simpleChain.Blockchain();

//get response For URL: http://localhost:8000/block/0 where 0 is blockheight
app.get('/block/:blockheight', (req, res) => {
    try
    {
        const param = req.params;
        return res.send(myBlockChain.getBlock(param.blockheight));
    }
    catch(err){
        res.status(400).send(err);
    }
        
});

//get response For URL: http://localhost:8000/stars/hash/:hash where :hash is hash value
app.get('/stars/hash/:hash', (req, res) => {
    try
    {
        const param = req.params;
        return res.send(param.hash);
    }
    catch(err){
        res.status(400).send(err);
    }
        
});

//get response For URL: http://localhost:8000/stars/address/:address where :address is address value
app.get('/stars/address/:address', (req, res) => {
    try
    {
        const param = req.params;
        return res.send(param.address);
    }
    catch(err){
        res.status(400).send(err);
    }
        
});

//post response For URL: http://localhost:8000/block
app.post('/block', function (req, res) {
    try
    {
        const Validation = new validateReference.Validation(req);

         // Check if signature is valid or invalid.
      
            
            Validation.validateSignature()((data) => {

                if (!data)  return res.status(401).json({
                    status: 401,
                    message: 'Signature is not valid'
                });

                else
                {
                    if (!req.body.address || !req.body.star ) 
                    {
                        res.send({
                            "status": 200,
                            "message": "Please provide the block data to create"
                          });
                    }
                    else
                    {
                        const body = { address, star } = req.body;
                        const story = star.story;
                        // Star JSON
                        body.star = {
                            ra: star.ra,
                            dec: star.dec,
                            mag: star.mag,
                            con: star.con,
                            story: new Buffer(story).toString('hex')
                        };
                        // Save information to LevelDb.
                        myBlockChain.addBlock(new simpleChain.Block(body)).then((data) => {
            
                            const height = myBlockChain.getBlockHeight();
                        // Retrieve current saved Star block with height.
                        const response = myBlockChain.getBlock(height);
                        // delete block by address.
                        Validation.invalidate(address);
                        res.status(201).send(response)
                        
                            res.send({
                                "status": 200,
                                "message": data
                              });
                           // res.send(data);
                        });
                        // Get current block height.
                        
                    }    
                }




            });
        }
    
        
   
    catch(err)
    {
        res.send({
            "status": 400,
            "message": err
          });
    }   
  }
       
  )

  //  
  //post response For URL: http://localhost:8000/requestValidation
app.post('/requestValidation', async function (req, res) {
    const validate = new validateReference.Validation(req);
    const address = req.body.address;

    let responsedata;
    try {
        // Check if notarization request is pending for the requested address.
        responsedata = await validate.getPendingRequest(address)
    } catch (error) {
        // Create new request for star notarization
        responsedata = await validate.saveNewValidation(address)
    }

    res.json(responsedata)
  })
   

  //post response For URL: http://localhost:8000/message-signature/validate
  app.post('/message-signature/validate', async function (req, res) {
    const validate = new validateReference.Validation(req);

    try {
        const { address, signature } = req.body;
        const responsedata = await validate.validateMsgSignature(address, signature);

        if (responsedata.registerStar) {
            res.json(responsedata)
        } else {
            res.status(401).json(responsedata)
        }
    } catch (error) {
        res.status(404).json({
            status: 404,
            message: error.message
        })
    }
  })
  

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
