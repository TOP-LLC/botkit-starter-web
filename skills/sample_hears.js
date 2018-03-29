module.exports = function(controller) {
  controller.hears("walrus", "message_received", function(bot, message) {
    console.log("I heard walrus!")
    bot.reply(message, "I heard a test")
  })
}
