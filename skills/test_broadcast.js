module.exports = (controller) => {
  console.log('Starting broadcast for early access');

  const bot = controller.spawn({});

  console.log('Bot say started!');

  bot.say(
    {
      text: 'How you like them notifications',
      channel: 'Bot-cjelwqdx62gk10128w3c0gewe',
    },
    (err, response) => {
      if (err) {
        return console.log('Error in bot say: ', err);
      }
      return response;
    },
  );
};
