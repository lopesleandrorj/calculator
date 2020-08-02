const cfenv = require('cfenv')

require('dotenv').config()

const appEnv = cfenv.getAppEnv()

const app = require('express')()

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const eventManager = require("./server/events/eventManager").start()


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const routes = require('./server/router')(app)



// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
    // print a message when the server starts listening
    console.log('server starting on ' + appEnv.url)
})
