module.exports = (controller) => {
  if (process.env.DASHBOT_API_KEY) {
    const DASHBOT_API_KEY = 'MbuwiGAxDAZnW99qqaVAir7VPfOlCqItWqYGbjST';
    console.log('Running dashbot with ', DASHBOT_API_KEY);
    const dashbot = require('dashbot')(DASHBOT_API_KEY).generic;
    controller.middleware.receive.use(dashbot.receive);
    controller.middleware.send.use(dashbot.send);
    controller.log.info('Thanks for using Dashbot. Visit https://www.dashbot.io/ to see your bot analytics in real time.');
  } else {
    controller.log.info('No DASHBOT_API_KEY specified. For free turnkey analytics for your bot, go to https://www.dashbot.io/ to get your key.');
  }
};
