module.exports = (controller) => {
  // Dashbot is a turnkey analytics platform for bots.
  // Sign up for a free key here: https://www.dashbot.io/ to see your bot analytics in real time.
  if (process.env.DASHBOT_API_KEY) {
    const DASHBOT_API_KEY =
      process.env.NODE_ENV === 'dev'
        ? process.env.DASHBOT_API_KEY_DEV
        : process.env.NODE_ENV === 'staging'
          ? process.env.DASHBOT_API_KEY_DEV
          : process.env.DASHBOT_API_KEY;
    const dashbot = require('dashbot')(DASHBOT_API_KEY).facebook;
    controller.middleware.receive.use(dashbot.receive);
    controller.middleware.send.use(dashbot.send);
    controller.log.info('Thanks for using Dashbot. Visit https://www.dashbot.io/ to see your bot analytics in real time.');
  } else {
    controller.log.info('No DASHBOT_API_KEY specified. For free turnkey analytics for your bot, go to https://www.dashbot.io/ to get your key.');
  }
};
