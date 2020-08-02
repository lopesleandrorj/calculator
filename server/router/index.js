const jwt = require('jsonwebtoken');
const fs = require('fs')
var cert = fs.readFileSync('private.pem')
const secret = 'passw0rd';
const cloudant = require('../cloudant')
const eventManager = require('../events/eventManager')

const verifyJWT = (req, res, next) => {
    var token = req.headers['authorization'].split(" ")[1]

    jwt.verify(token, publicKey, { algorithm: ["RS256"] }, function(err, decoded) {
        if (err) 
            return res.status(500).send({ auth: false, message: 'Invalid Token' }); 

        req.user.id = decoded.id
        next(); 
    });

} 
module.exports = (app) => {

    app.get('/event', async (req, res , next) => {
        payload = {
            "user": "test"
        }
        eventManager.publish("", "USER_HAS_REGISTERED", new Buffer.from(JSON.stringify(payload)))
    })
    
    app.get('/auth/token', async (req, res, next) => {  
        
        const authDB = await cloudant.instance_database('authorization')

        authDB.partitionedFind('authorization', {
            "selector": {
                "_id": {
                    "$ne": 0
                }, "CLIENT_ID": {
                    "$eq": req.query.CLIENT_ID
                },"CLIENT_SECRET": {
                    "$eq": req.query.CLIENT_SECRET
                }
            }
        }, (err, result) => {
            if (err) {
                return res.status(500).send({ auth: false, "error": err })
            } else {
                if (result.docs.length > 0) {
                    var token = jwt.sign({ id: req.query.id, exp: Date.now() / 1000 + 86400 }, { key: cert, passphrase: 'password'}, { algorithm: 'RS256'}, secret); 
                    
                    return res.status(200).send({ auth: true, access_token: token, expiration: 86400 });
                } else {
                    return res.status(500).send({ auth: false, error: 'Invalid credentials' });
                } 
            }
        })
    })    

    app.get('/test', verifyJWT, (req, res, next) => {
        return res.status(200).send({
            auth: 'true', id: req.user.id
        })
    }) 
}