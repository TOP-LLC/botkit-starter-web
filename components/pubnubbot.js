const PubNub = require('pubnub');
const debug = require('debug')('botkit:pubnub');
const rp = require('request-promise');
const lokkaClient = require('./lokka_graphcool.js');

module.exports = (Botkit, config) => {
  const controller = Botkit.core(config);

  controller.defineBot((botkit, config) => {
    const bot = {
      type: 'pubnubapi',
      botkit,
      config: config || {},
      utterances: botkit.utterances,
    };

    // here is where you make the API call to SEND a message
    // the message object should be in the proper format already
    bot.send = (message, cb) => {
      debug('SEND: ', message);

      const handleSMS = () => {
        console.log('Running handleSMS');

        const options = {
          method: 'POST',
          uri: 'http://borilabs.com/textline/send-email.php',
          formData: {
            message: message.text,
            phone: '9517647045',
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        rp
          .post(options)
          .then((response) => {
            // handle success
            console.log('Ran handleSMS ', JSON.stringify(response));
          })
          .catch((response) => {
            // handle error
            console.log('error in handleSMS ', response);
          });
      };

      const handleNotification = (userId) => {
        debug(`Running handleNotification for ${userId} with message ${message.text}`);

        const query = `
          mutation($userId: ID!, $text: String!) {
            createNotification(userId: $userId, text: $text, read: false) {
              id
            }
          }
        `;

        const vars = {
          userId,
          text: message.text,
          read: false,
        };

        return lokkaClient.query(query, vars).then((result) => {
          debug('Result of notification creation: ', result);
          return result;
        });
      };

      bot.client.hereNow(
        {
          channels: [message.channel],
          includeUUIDs: true,
          includeState: true,
        },
        (status, response) => {
          const userId = message.channel.slice(4);

          debug('Here NOW!', JSON.stringify(response));

          if (!response.channels[`Bot-${userId}`].occupants.find(o => o.uuid === userId)) {
            handleSMS();
            handleNotification(userId);
          }
          return response;
        },
      );

      console.log('Running before publish');
      bot.client.publish(
        {
          message: {
            text: message.text,
            userId: message.publisher,
            user: 'TOP bot',
            avatarURL:
              'https://files.graph.cool/cj9uk5gqb3qdb0164rx0iu633/cjaua2upq01px01942uecvukr',
          },
          channel: message.channel,
          sendByPost: false, // true to send via post
          storeInHistory: true, // override default storage options
          meta: {
            botReply: true,
          }, // publish extra meta with the request
        },
        (status, response) => {
          if (status.error) {
            // handle error
            debug(status);
            cb(status);
          } else {
            debug('message Published w/ timetoken', response.timetoken);
          }
        },
      );
      console.log('Returning callback');
      return cb();
    };

    // this function takes an incoming message (from a user) and an outgoing message (reply from bot)
    // and ensures that the reply has the appropriate fields to appear as a reply
    bot.reply = (src, resp, cb) => {
      debug('Replying to message from user', src, resp);
      if (typeof resp === 'string') {
        resp = {
          text: resp,
        };
      }
      resp.channel = src.channel;
      bot.say(resp, cb);
    };

    // this function defines the mechanism by which botkit looks for ongoing conversations
    // probably leave as is!
    bot.findConversation = (message, cb) => {
      for (let t = 0; t < botkit.tasks.length; t++) {
        for (let c = 0; c < botkit.tasks[t].convos.length; c++) {
          if (
            botkit.tasks[t].convos[c].isActive() &&
            botkit.tasks[t].convos[c].source_message.user == message.user &&
            botkit.excludedEvents.indexOf(message.type) == -1 // this type of message should not be included
          ) {
            debug('Found a conversation!', message);
            cb(botkit.tasks[t].convos[c]);
            return;
          }
        }
      }
      debug('No conversation found! ', message);
      cb();
    };

    bot.client = new PubNub({
      subscribeKey: 'sub-c-c574e958-3357-11e8-a409-76cf0979147a',
      publishKey: 'pub-c-3185f8fa-be4a-48d3-9091-da974f093b00',
      ssl: true,
    });

    return bot;
  });

  // provide one or more normalize middleware functions that take a raw incoming message
  // and ensure that the key botkit fields are present -- user, channel, text, and type
  controller.middleware.normalize.use((bot, message, next) => {
    debug('NORMALIZE', message);
    if (message.message.type === 'message_bot') {
      debug("Message type bot, don't change");
      message.subscription = 'subscriptiongoeshere';
      message.type = 'ambient';
      message.channel = message.raw_message.channel;
      message.text = message.raw_message.message.text;
      message.user = message.raw_message.publisher;
      next();
    } else {
      debug('Message received type');
      message.type = 'message_received';
      message.channel = message.raw_message.channel;
      message.text = message.raw_message.message.text;
      message.user = message.raw_message.publisher;
      next();
    }
  });

  // provide one or more ways to format outgoing messages from botkit messages into
  // the necessary format required by the platform API
  // at a minimum, copy all fields from `message` to `platform_message`
  controller.middleware.format.use((bot, message, platform_message, next) => {
    debug('Format debug', message);
    platform_message.text = message.text;
    platform_message.channel = message.channel;
    platform_message.continue_type = message.continue_typing;
    platform_message.sent_timestamp = message.sent_timestamp;
    next();
  });

  // Handle all webhook endpoints

  // provide a way to receive messages - normally by handling an incoming webhook as below!
  controller.handleWebhookPayload = (req, res) => {
    const payload = req.body;

    // var bot = controller.spawn({});
    // controller.ingest(bot, payload, res);

    debug('received webhook');

    res.status(200);
    res.end('Got it, thanks!');
  };
  // provide a way to receive messages - normally by handling an incoming webhook as below!
  controller.subscribeToChannels = () => {
    const bot = controller.spawn({});

    const client = new PubNub({
      subscribeKey: 'sub-c-c574e958-3357-11e8-a409-76cf0979147a',
      publishKey: 'pub-c-3185f8fa-be4a-48d3-9091-da974f093b00',
      ssl: true,
      withPresence: true,
    });

    client.addListener({
      message(message) {
        debug('New Message!', message);
        if (message.message.user === 'TOP bot' || message.message.typeOf === 'object') {
          return debug('IGNORE ME I AM A BOT');
        }
        controller.ingest(bot, message, null);
      },
      presence(presenceEvent) {
        debug('Got a presence event', presenceEvent);
      },
    });

    debug('Subscribing..');

    client.subscribe({
      channelGroups: ['Bot'],
      withPresence: true,
    });
  };

  return controller;
};
