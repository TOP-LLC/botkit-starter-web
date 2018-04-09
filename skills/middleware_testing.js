module.exports = function(controller) {
  // Incoming Middleware

  controller.middleware.ingest.use(function(bot, message, res, next) {
    console.log("INGEST ", message, "Response", res)

    next()
  })

  controller.middleware.normalize.use(function(bot, message, next) {
    console.log("NORMALIZE ", message)

    next()
  })

  controller.middleware.categorize.use(function(bot, message, next) {
    console.log("CATEGORIZE ", message)

    next()
  })

  controller.middleware.receive.use(function(bot, message, next) {
    console.log("RECEIVE ", message)

    next()
  })

  controller.middleware.capture.use(function(bot, message, next) {
    // log the outgoing message for debugging purposes
    console.log("CAPTURE ", message)

    next()
  })

  controller.middleware.heard.use(function(bot, message, next) {
    console.log("HEARD ", message)

    next()
  })

  //   Outgoing middleware

  controller.on("message_received", function(bot, message) {
    console.log("Does this fire after message received?")
  })
}
