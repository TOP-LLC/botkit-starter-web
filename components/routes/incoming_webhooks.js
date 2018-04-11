const debug = require('debug')('botkit:incoming_webhooks');

module.exports = (webserver, controller) => {
  debug('Configured /botkit/receive url');
  webserver.post('/botkit/receive', (req, res) => {
    // respond to Slack that the webhook has been received.
    res.status(200);

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res);
  });

  debug('Configured /challengesubmit url');
  webserver.post('/challenge/submit', (req, res) => {
    // respond to Slack that the webhook has been received.

    debug('Received: ', req);

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res);
  });
};
