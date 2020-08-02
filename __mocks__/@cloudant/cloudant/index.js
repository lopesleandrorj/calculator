require('dotenv').config()

const Cloudant = require('@cloudant/cloudant')

var cloudant = Cloudant({
        "account": process.env.CLOUDANT_USERNAME, 
        "password": process.env.CLOUDANT_PASSWORD
})

function instance_database(database) {
    var db = cloudant.db.use(database)
    return db
}

module.exports = { instance_database }