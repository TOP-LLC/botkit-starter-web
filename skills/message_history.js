module.exports = function(controller) {
  if (controller.storage && controller.storage.history) {
    console.log("Storaging function running")

    // expose history as an endpoint
    controller.webserver.post("/botkit/history", function(req, res) {
      console.log("Botkit history endpoint hit")
      if (req.body.user) {
        controller.storage.history
          .getHistoryForUser(req.body.user, 10)
          .then(function(history) {
            res.json({
              success: true,
              history: history.map(function(h) {
                return h.message
              })
            })
          })
          .catch(function(err) {
            res.json({ success: false, history: [], error: err })
          })
      } else {
        res.json({ success: false, history: [], error: "no user specified" })
      }
    })

    function logMessage(message, user) {
      console.log("Logging a message")
      if (message.type == "message" || message.type == "message_received") {
        controller.storage.history
          .addToHistory(message, message.user)
          .catch(function(err) {
            console.log("Error storing history: ", err)
            console.error("Error storing history: ", err)
          })
        console.log("Added message to history")
      }
    }

    // log incoming messages to the user history
    controller.middleware.receive.use(function(bot, message, next) {
      console.log("Middleware receive use incoming message")
      controller.storage.users.get(message.user, function(err, user) {
        if (err) {
          return console.log(
            "Error in middleware receive incoming messages loggin: ",
            err
          )
        }
        logMessage(message, user)
      })
      next()
    })

    controller.middleware.format.use(function(
      bot,
      message,
      platform_message,
      next
    ) {
      console.log("Middleware format for logging message")
      controller.storage.users.get(message.to, function(err, user) {
        if (err) {
          return console.log("Error storing message: ", err)
        }
        platform_message = message
        logMessage(platform_message, user)
      })
      next()
    })
  } else {
    console.log("Configure a MONGO_URI to enable message history")
    controller.webserver.post("/botkit/history", function(req, res) {
      res.json({ success: true, history: [] })
    })
  }
}
