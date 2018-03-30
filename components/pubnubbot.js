var PubNub = require("pubnub")

module.exports = function(Botkit, config) {
  var controller = Botkit.core(config)

  controller.defineBot(function(botkit, config) {
    var bot = {
      type: "pubnubapi",
      botkit: botkit,
      config: config || {},
      utterances: botkit.utterances
    }

    // here is where you make the API call to SEND a message
    // the message object should be in the proper format already
    bot.send = function(message, cb) {
      console.log("SEND: ", message)
      bot.client.publish(
        {
          message: {
            text: message.text,
            userId: message.publisher,
            user: "TOP bot",
            type: "message_bot"
          },
          channel: message.channel,
          sendByPost: false, // true to send via post
          storeInHistory: true, //override default storage options
          meta: {
            botReply: true
          } // publish extra meta with the request
        },
        function(status, response) {
          if (status.error) {
            // handle error
            console.log(status)
          } else {
            console.log("message Published w/ timetoken", response.timetoken)
          }
        }
      )
    }

    // this function takes an incoming message (from a user) and an outgoing message (reply from bot)
    // and ensures that the reply has the appropriate fields to appear as a reply
    bot.reply = function(src, resp, cb) {
      console.log("Replying to message from user", src, resp)
      if (typeof resp == "string") {
        resp = {
          text: resp
        }
      }
      resp.channel = src.channel
      bot.send(resp, cb)
    }

    // this function defines the mechanism by which botkit looks for ongoing conversations
    // probably leave as is!
    bot.findConversation = function(message, cb) {
      for (var t = 0; t < botkit.tasks.length; t++) {
        for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
          if (
            botkit.tasks[t].convos[c].isActive() &&
            botkit.tasks[t].convos[c].source_message.user == message.user &&
            botkit.excludedEvents.indexOf(message.type) == -1 // this type of message should not be included
          ) {
            cb(botkit.tasks[t].convos[c])
            return
          }
        }
      }
      cb()
    }

    bot.client = new PubNub({
      subscribeKey: "sub-c-c574e958-3357-11e8-a409-76cf0979147a",
      publishKey: "pub-c-3185f8fa-be4a-48d3-9091-da974f093b00",
      secretKey: "sec-c-MjNhOWVlZGUtYzYwMC00ZDcyLWJjZmItOWYxYjM5MTkzZTgx",
      ssl: true
    })

    return bot
  })

  // provide one or more normalize middleware functions that take a raw incoming message
  // and ensure that the key botkit fields are present -- user, channel, text, and type
  controller.middleware.normalize.use(function(bot, message, next) {
    console.log("NORMALIZE", message)
    if (message.message.type === "message_bot") {
      console.log("Message type bot, don't change")
      message.subscription = "subscriptiongoeshere"
      message.type = "ambient"
      message.channel = message.raw_message.channel
      message.text = message.raw_message.message.text
      message.user = message.raw_message.publisher
      next()
    } else {
      console.log("Message received type")
      message.subscription = "subscriptiongoeshere"
      message.type = "message_received"
      message.channel = message.raw_message.channel
      message.text = message.raw_message.message.text
      message.user = message.raw_message.publisher
      next()
    }
  })

  controller.middleware.receive.use(function(bot, message, next) {
    console.log("RECEIVED ", message)

    next()
  })

  controller.middleware.capture.use(function(bot, message, next) {
    // log the outgoing message for debugging purposes
    console.log("CAPTURED ", message)

    next()
  })

  controller.middleware.send.use(function(bot, message, next) {
    // log the outgoing message for debugging purposes
    console.log("SENDING ", message)

    next()
  })

  controller.middleware.heard.use(function(bot, message, next) {
    console.log("HEARD ", message)

    next()
  })

  // provide one or more ways to format outgoing messages from botkit messages into
  // the necessary format required by the platform API
  // at a minimum, copy all fields from `message` to `platform_message`
  controller.middleware.format.use(function(
    bot,
    message,
    platform_message,
    next
  ) {
    console.log("Format is ", platform_message)
    next()
  })

  // provide a way to receive messages - normally by handling an incoming webhook as below!
  controller.subscribeToChannels = function() {
    var bot = controller.spawn({})

    client = new PubNub({
      subscribeKey: "sub-c-c574e958-3357-11e8-a409-76cf0979147a",
      publishKey: "pub-c-3185f8fa-be4a-48d3-9091-da974f093b00",
      secretKey: "sec-c-MjNhOWVlZGUtYzYwMC00ZDcyLWJjZmItOWYxYjM5MTkzZTgx",
      ssl: true
    })

    client.addListener({
      message: function(message) {
        console.log("New Message!", message)
        controller.ingest(bot, message, null)
      }
    })

    console.log("Subscribing..")

    client.subscribe({
      channels: ["Channel-Test"],
      withPresence: true
    })
  }

  return controller
}
