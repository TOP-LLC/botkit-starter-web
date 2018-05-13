module.exports = function(controller) {
  controller.hears("walrus", "message_received", function(bot, message) {
    console.log("I heard walrus!")
    bot.reply(message, "Yep, I'm working. You're good.")
  })

  // controller.hears("train", "message_received", function(bot, message) {
  //   if (message.userMetadata) {
  //     if (message.userMetadata.botReply) {
  //       return console.log("Bot message. Just ignore.")
  //     } else {
  //       console.log("I heard train!")
  //       return bot.reply(message, "BOOM! Time for your training!")
  //     }
  //     console.log("I heard train!")
  //     return bot.reply(message, "BOOM! Time for your training!")
  //   } else {
  //     console.log("I heard train!")
  //     return bot.reply(message, "BOOM! Time for your training!")
  //   }
  // })

  controller.hears(["discover_TOP"], "message_received", function(
    bot,
    message
  ) {
    controller.studio
      .get(bot, "discoverTOP", message.user, message.channel)
      .then(function(convo) {
        // crucial! call convo.activate to set it in motion
        console.log("Did this work?")
        convo.activate()
      })
  })
}
