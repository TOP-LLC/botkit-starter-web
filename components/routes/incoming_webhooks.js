import eventStart from './../functions/eventStart';

const debug = require('debug')('botkit:incoming_webhooks');

module.exports = (webserver, controller) => {
  debug('Configured /botkit/receive url');
  webserver.post('/botkit/receive', (req, res) => {
    // respond to Slack that the webhook has been received.
    res.status(200);

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res);
  });

  debug('Configured /onboarstart url');
  webserver.post('/onboardstart', (req, res) => {
    debug('Running onboarding start', JSON.stringify(req.body));

    const { user } = req.body;

    const bot = controller.spawn({});

    controller.studio.get(bot, 'New Client Onboarding', user.id, `Bot-${user.id}`).then((convo) => {
      // crucial! call convo.activate to set it in motion
      convo.setVar('firstName', user.firstName);

      convo.activate();
    });

    res.status(200);

    res.end('Got it!');
  });

  debug('Configured /eventstart url');
  webserver.post('/eventstart', async (req, res) => {
    debug('Running event start', JSON.stringify(req.body));

    const { schedule } = req.body.data.Event.node;

    const event = req.body.data.Event.node;

    const eventRes = await eventStart(event);
    debug('Returned event data: ', eventRes);
    const {
      eventType, greeting, title, number,
    } = eventRes;

    const { user } = schedule;

    const bot = controller.spawn({});

    controller.studio.get(bot, 'New Event Start', user.id, `Bot-${user.id}`).then((convo) => {
      convo.setVar('firstName', user.firstName);
      convo.setVar('type', eventType);
      convo.setVar('greeting', greeting);
      convo.setVar('title', title);
      convo.setVar('number', number);
      convo.setVar('url', 'http://localhost:3000/train/current');

      convo.activate();
    });

    res.status(200);

    res.end('Got it!');
  });

  // Client submits a challenge for review
  debug('Configured /challengesubmit url');
  webserver.post('/challengesubmit', (req, res) => {
    // Challenge will either be intermittent or touchpoint. If Touchpoint, check if all challenges for given session are complete.

    debug('Received: ', JSON.stringify(req.body));

    const {
      type,
      title,
      session,
      challengeCriteria,
      activities,
      reviewType,
    } = req.body.data.ChallengeMetric.node.challenge;
    const { id, firstName, lastName } = req.body.data.ChallengeMetric.node.user;

    if (reviewType === 'Touchpoint') {
      if (type === 'Submission') {
        // Trigger bot convo for asking questions

        debug('Challenge is a Submission');

        const bot = controller.spawn({});

        controller.studio
          .get(bot, `challenge_metric_${type.toLowerCase()}_start`, id, `Bot-${id}`)
          .then((convo) => {
            convo.setVar('firstName', firstName);
            convo.setVar('lastName', lastName);
            convo.setVar('title', title);
            convo.setVar('type', type);
            convo.setVar('text', activities[0].text);
            convo.setVar('userId', id);

            // crucial! call convo.activate to set it in motion
            convo.activate();
          });

        // Trigger bot convo if this is only one of many challenges remaining to be completed
      } else {
        // Trigger bot convo for confirming submission

        debug('Challenge is not a submission');

        const bot = controller.spawn({});

        controller.studio.get(bot, 'challenge_metric_received', id, `Bot-${id}`).then((convo) => {
          convo.setVar('firstName', firstName);
          convo.setVar('lastName', lastName);
          convo.setVar('title', title);
          convo.setVar('type', type);
          convo.setVar('userId', id);
          convo.setVar('sessionTitle', session.title);
          convo.setVar('sessionNumber', session.number);

          // crucial! call convo.activate to set it in motion
          convo.activate();
        });
      }
    } else if (type === 'Submission') {
      // Trigger bot convo for asking questions

      debug('Challenge is a Submission');

      const bot = controller.spawn({});

      controller.studio
        .get(bot, `challenge_metric_${type.toLowerCase()}_incremental_start`, id, `Bot-${id}`)
        .then((convo) => {
          convo.setVar('firstName', firstName);
          convo.setVar('lastName', lastName);
          convo.setVar('title', title);
          convo.setVar('type', type);
          convo.setVar('text', activities[0].text);
          convo.setVar('userId', id);

          // crucial! call convo.activate to set it in motion
          convo.activate();
        });

      // Trigger bot convo if this is only one of many challenges remaining to be completed
    } else {
      // Trigger bot convo for confirming submission

      debug('Challenge is not a submission');

      const bot = controller.spawn({});

      controller.studio
        .get(bot, 'challenge_metric_incremental_received', id, `Bot-${id}`)
        .then((convo) => {
          convo.setVar('firstName', firstName);
          convo.setVar('lastName', lastName);
          convo.setVar('title', title);
          convo.setVar('type', type);
          convo.setVar('userId', id);
          convo.setVar('sessionTitle', session.title);
          convo.setVar('sessionNumber', session.number);

          // crucial! call convo.activate to set it in motion
          convo.activate();
        });
    }

    res.status(200);
    res.end('OK');

    // Now, pass the webhook into be processed
    // controller.handleWebhookPayload(req, res);
  });
};
