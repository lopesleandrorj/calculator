var Cloudant = require('@cloudant/cloudant')
var cloudant = Cloudant({
    "account": process.env.CLOUDANT_USERNAME, 
    "password": process.env.CLOUDANT_PASSWORD
    },
    (err) => {
        if (err) {
            console.log("error connecting to Cloudant: " + err);
        } else {
            console.log("Connected to Cloudant");
        }
    })


async function instance_database(database) {
    var db = await cloudant.db.use(database)
    return db
}

module.exports = { instance_database }