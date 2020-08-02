var amqp = require('amqplib/callback_api')

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null
var pubChannel = null;
var offlinePubQueue = []

const start = () => {
  amqp.connect("amqp://vnlqxwsr:sF_0RPtK_9NYWZbkIrNkEgsHILmFfCyv@llama.rmq.cloudamqp.com/vnlqxwsr" + "?heartbeat=60", (err, conn) => {
    if (err) {
      console.error("[AMQP]", err.message)
      return setTimeout(start, 1000)
    }

    conn.on("error", (err) => {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message)
      }
    })

    conn.on("close", () => {
      console.error("[AMQP] reconnecting")
      return setTimeout(start, 1000)
    })

    console.log("[AMQP] connected")
    amqpConn = conn
    startPublisher()
    startWorker()
  })
}

const initiateFeatures = () => {
  startPublisher()
  startWorker()
}

const startPublisher = () => {
  amqpConn.createConfirmChannel((err, ch) => {
    if (closeOnErr(err)) return
      ch.on("error", (err) => {
      console.error("[AMQP] channel error", err.message)
    })
    ch.on("close", () => {
      console.log("[AMQP] channel closed")
    })

    pubChannel = ch;
    while (true) {
      var m = offlinePubQueue.shift()
      if (!m) break;
      publish(m[0], m[1], m[2])
    }
  })
}

const publish = (exchange, routingKey, content) => {
  try {
    pubChannel.publish(exchange, routingKey, content, { persistent: true },
                      (err, ok) => {
                        if (err) {
                          console.error("[AMQP] publish", err)
                          offlinePubQueue.push([exchange, routingKey, content])
                          pubChannel.connection.close()
                        }
                      })
  } catch (e) {
    console.error("[AMQP] publish", e.message)
    offlinePubQueue.push([exchange, routingKey, content])
  }
}

module.exports = { start, publish }

// A worker that acks messages only if processed succesfully
function startWorker() {
  amqpConn.createChannel(function(err, ch) {
    if (closeOnErr(err)) return
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message)
    });

    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });

    ch.prefetch(10);
    ch.assertQueue("Jobs", { durable: true }, function(err, _ok) {
      if (closeOnErr(err)) return
      ch.consume("Jobs", processMsg, { noAck: false })
      console.log("Worker is started")
    });

    function processMsg(msg) {
      work(msg, function(ok) {
        try {
          if (ok)
            ch.ack(msg)
          else
            ch.reject(msg, true)
        } catch (e) {
          closeOnErr(e)
        }
      });
    }
  });
}

function work(msg, cb) {
  console.log("Got msg ", msg.content.toString())
  cb(true);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error("[AMQP] error", err)
  amqpConn.close();
  return true;
}

setInterval(function() {
  json = {
      "message": "This is a message"
  }
  publish("", "jobs", Buffer.from(JSON.stringify(json)))
}, 10000);