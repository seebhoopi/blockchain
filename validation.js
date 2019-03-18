const db = require('level')('./data/star');
const bitcoinMessage = require('bitcoinjs-message');
const bitcoinjsLibrary = require('bitcoinjs-lib');
//ASCII reg expression
const checkAscii = (str) => /^[\x00-\x7F]*$/.test(str);

/* ===== Validation Class ==========================
|  Class with a constructor for new request for Validation|
  ================================================*/

class Validation {

    constructor (req) {
        //Receive new request for validation.
        this.req = req
    }

    async validateRequest () {
        // Star story supports text limited to 250 words (500 bytes),
        const MAX_STORY_BYTES = 500;
        // Retrieve star JSON from the request.
        const { star } = this.req.body;
        // Star co-ordinates in the sky. RA = Right Ascension, DEC = Declination, MAG = Magnitude & Story.
        const { ra, dec, mag, con, story } = star;

        //Check if the requested address is not empty.
        if (!this.validateAddressParameter() || !this.req.body.star) {
            throw new Error('Fill the address and star parameters')
        }

        //Check if star co-ordinates are non-empty string properties
        if (typeof ra !== 'string' || typeof dec !== 'string' || typeof mag !== 'string' || typeof  con !== 'string' ||
            typeof story !== 'string' || !ra.length || !dec.length || !mag.length || !con.length || !story.length) {
            throw new Error("Your star information should include non-empty string properties for 'ra', 'dec', 'mag', 'con' and 'story'")
        }

        //Check if story meets the criteria for 500 bytes.
        if (new Buffer(story).length > MAX_STORY_BYTES) {
            throw new Error('Your star story too is long. Maximum size is 500 bytes')
        }
 
        //Check if story contains ASCII text only.
        if (!checkAscii(story)) {
            throw new Error('Your star story contains non-ASCII symbols')
        }
    }

    // Check if signature is valid for the requested address.
    async validateSignature () {
        return new Promise((resolve, reject) => {

            db.get(this.req.body.address, (error, value) => {
                if (value === undefined || error) {
                    // Throw error if the address is not found.
                    return reject(new Error('Not found'))
                } else
                {
                    value = JSON.parse(value);
                    const checkValue = value.messageSignature === 'valid';
                    resolve(checkValue);
                } 
            })

        });
           
                // else if (error) {
                //     return reject(error)
                // }

        //  db.get(this.req.body.address)
        //     .then((value) => {
        //         value = JSON.parse(value);
        //         const checkValue = value.messageSignature === 'valid';
        //         return checkValue;
        //     }) //If not validated throw error
        //     .catch(() => { throw new Error('Not authorized') })
        // });
    }

    // Remove the address
    removeAddress (address) {
        db.del(address)
    }

    // Validate Message Signature with requested Address.
    async validateMsgSignature (address, signature) {
        return new Promise((resolve, reject) => {
            db.get(address, (error, value) => {
                console.log(JSON.stringify(value));
                if (value === undefined) {
                    return reject(new Error('Not found'))
                } else if (error) {
                    return reject(error)
                }

                value = JSON.parse(value);
                console.log(JSON.stringify(value));
                // If address has been signed return true.
                if (value.messageSignature === 'valid') {
                    return resolve({
                        registerStar: true,
                        status: value
                    })
                } else {

                    console.log("Ln 105  "+ JSON.stringify(value));

                    // Get time period of 5 minutes from the current time.
                    const fiveMinutes = Date.now() - (5 * 60 * 1000);
                    // Check if the validation time period has expired.
                    const isExpired = value.requestTimeStamp < fiveMinutes;

                    let validateSignature = false;
                    // If the validation period is over
                    if (isExpired) {
                        value.validationWindow = 0;
                        value.messageSignature = 'Validation window was expired'
                    } else {
                        // Show validation period countdown.
                        value.validationWindow = Math.floor((value.requestTimeStamp - fiveMinutes) / 1000);

                        try {
                            console.log(value.message);
                            console.log(address);
                            console.log(signature);
                            console.log("Ln 126  "+ JSON.stringify(value.message));

                            let wif  = address ;
let imported = bitcoinjsLibrary.PrivateKey.fromWIF(wif);
console.log('Priv = ' + imported.toString());
                            // let b = Buffer.from(address, 'base64')
                            // const rawBytes = Buffer.from(address);
                            // const encoded = rawBytes.toString('base64');

                            // let s = b.toString();
// console.log("Ln 130 s "+encoded);
// console.log("Ln 130 s "+ JSON.stringify(encoded));
                            // Verify message with address & signature using bitcoin-js
                            validateSignature = bitcoinMessage.verify(value.message, imported.toString(), signature)
                            console.log("come to success 124" + JSON.stringify(validateSignature));
                        } catch (error) {
                            // Validation failed
                            console.log("come to error 126" + error);
                            validateSignature = false
                        }

                        value.messageSignature = validateSignature ? 'valid' : 'invalid'
                    }

                    db.put(address, JSON.stringify(value));

                    return resolve({
                        registerStar: !isExpired && validateSignature,
                        status: value
                    })
                }
            })
        })
    }
   
    // Save New Validation Request to Blockchain
    async saveNewValidation (address) {
        const timestamp = Date.now();
        // Saving message:  [walletAddress]:[timeStamp]:starRegistry
        const message = `${address}:${timestamp}:starRegistry`;
        const validationWindow = 300;
        const responseData = {
            address: address,
            message: message,
            requestTimeStamp: timestamp,
            validationWindow: validationWindow
        };
        console.log(JSON.stringify(responseData));
        db.put(responseData.address, JSON.stringify(responseData));
        return responseData;
    }

   async getPendingRequest (address) {
        return new Promise((resolve, reject) => {
            db.get(address, (error, value) => {
                if (value === undefined) {
                    return reject(new Error('Not found'))
                } else if (error) {
                    return reject(error)
                }
                value = JSON.parse(value);
                const nowSubFiveMinutes = Date.now() - (5 * 60 * 1000);
                const isExpired = value.requestTimeStamp < nowSubFiveMinutes;
                if (isExpired) {
                    resolve(this.saveNewValidation(address))
                } else {
                    const data = {
                        address: address,
                        message: value.message,
                        requestTimeStamp: value.requestTimeStamp,
                        validationWindow: Math.floor((value.requestTimeStamp - nowSubFiveMinutes) / 1000)
                    };
                    resolve(data)
                }
            })
        })
    }

        // Check if the signature is valid for the requested address.
       validateRequestSignature () {
            return db.get(this.req.body.address)
                .then((value) => {
                    value = JSON.parse(value);
                    return value.messageSignature === 'valid'
                }) //If not validated throw error
                .catch(() => { throw new Error('Not authorized') })
        }
}

module.exports.Validation = Validation;