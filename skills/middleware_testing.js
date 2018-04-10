const debug = require('debug')('botkit:middleware');

module.exports = function (controller) {
  // Incoming Middleware

  controller.middleware.ingest.use((bot, message, res, next) => {
    console.log('INGEST ', message, 'Response', res);

    next();
  });

  controller.middleware.normalize.use((bot, message, next) => {
    console.log('NORMALIZE ', message);

    next();
  });

  controller.middleware.categorize.use((bot, message, next) => {
    console.log('CATEGORIZE ', message);

    next();
  });

  controller.middleware.receive.use((bot, message, next) => {
    debug('RECEIVE ', message);

    next();
  });

  controller.middleware.heard.use((bot, message, next) => {
    console.log('HEARD ', message);

    next();
  });
};
