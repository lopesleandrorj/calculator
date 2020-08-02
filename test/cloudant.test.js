var cloudant = require('@cloudant/cloudant')
var usersDB = cloudant.instance_database("users")
var docID = 'jest'

describe('Testing cloudant', () => {
    // it('should create a database in cloudant', async(done) => {
    //     // await expect.assertions(1)
    //     // await usersDB.insert({ _id: 'jest', test: 'ok' }, (err, data) => {
    //     //     expect(data).toHaveProperty("ok")
    //     //     done()
    //     // })
    // })

    it('should add a document to users database', async(done) => {
        await expect.assertions(1)
        await usersDB.insert({ _id: 'jest', test: 'ok' }, (err, data) => {
            expect(data).toHaveProperty("ok")
            done()
        })
    })

    it('should query a document in a cloudant database', async(done) => {
        await usersDB.find({
            "selector": {
              "_id": {
                "$eq": 'jest'
              }
            }
          }, (err, data) => {
            expect(data).toHaveProperty('docs')
            done()
        })
    })

    it("should delete a document in a cloudant database", async(done) => {
        await usersDB.find({"selector": { "_id": { "$eq": 'jest' } } }, async (err, data) => {
            await usersDB.destroy(data.docs[0]._id, data.docs[0]._rev, (err, data) => {
                expect(data).toHaveProperty("ok")
                done()
            })
        })
    })

    //     // cloudant.connect().then(dblist => { console.log(dblist) })
    //     const data = { }
        
    //     // expect(cloudant.connect()).resolves.toBe('1')
    // })

    // it('should be able to create a database in cloudant', () => {
    //     cloudant.create_database('test')
    // })

    // it('should be able to insert a document in cloudant', () => {
    //     cloudant.insert()
    // })

    // it('should be able to delete a document in cloudant', () => {
    //     cloudant.insert()
    // })

    // it('should be able to update a document in cloudant', () => {
    //     cloudant.insert()
    // })
})