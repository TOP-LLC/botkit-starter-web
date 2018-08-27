require('babel-register');
require('babel-polyfill');
var winston = require('winston');
require('winston-loggly-bulk');

const env = require('node-env-file');

env(`${__dirname}/.env`);

const Botkit = require('botkit');
const debug = require('debug')('botkit:main');

const PubNubBot = require(`${__dirname}/components/pubnubbot.js`);

const bot_options = {
  studio_token: process.env.studio_token,
  studio_command_uri: process.env.studio_command_uri,
  studio_stats_uri: process.env.studio_command_uri,
  replyWithTyping: true,
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
  // create a custom db access method
  const db = require(`${__dirname}/components/database.js`)({});
  bot_options.storage = db;
} else {
  bot_options.json_file_store = `${__dirname}/.data/db/`; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
// var controller = Botkit.socketbot(bot_options)

const controller = PubNubBot(Botkit, bot_options);

// Set up an Express-powered webserver to expose oauth and webhook endpoints
const webserver = require(`${__dirname}/components/express_webserver.js`)(controller);

// Load in some helpers that make running Botkit on Glitch.com better
require(`${__dirname}/components/plugin_glitch.js`)(controller);

// Load in a plugin that defines the bot's identity
require(`${__dirname}/components/plugin_identity.js`)(controller);

// Enable Dashbot.io plugin
require(__dirname + "/components/plugin_dashbot.js")(controller)

// Load Cron Jobs
// require(`${__dirname}/components/crons/touchpoint_appointment_notification.js`)(controller);
// require(`${__dirname}/components/crons/weighin_weekly_notification.js`)(controller);
// require(`${__dirname}/components/crons/sprint_not_complete_reminder.js`)(controller);
require(`${__dirname}/components/crons/daily_habit.js`)();
// require(`${__dirname}/components/crons/daily_challenge.js`)();
require(`${__dirname}/components/crons/daily_schedule.js`)();
require(`${__dirname}/components/crons/top_live_update.js`)();
require(`${__dirname}/components/crons/active_habit_update.js`)();
require(`${__dirname}/components/crons/top_prelive_to_live_update.js`)();

// Testing functions
// require(`${__dirname}/components/functions/sendTwilio.js`)();

// enable advanced botkit studio metrics
// and capture the metrics API to use with the identity plugin!
controller.metrics = require('botkit-studio-metrics')(controller);

// // Open the web socket server
controller.subscribeToChannels();

const normalizedPath = require('path').join(__dirname, 'skills');
require('fs')
  .readdirSync(normalizedPath)
  .forEach((file) => {
    require(`./skills/${file}`)(controller);
  });

// Start the bot brain in motion!!
controller.startTicking();

console.log(`I AM ONLINE! COME TALK TO ME: http://localhost:${process.env.PORT || 3000}`);
 
 winston.add(winston.transports.Loggly, {
    token: "1067bc45-bd5a-4a5f-9c9f-08c357f99adf",
    subdomain: "top",
    tags: ["Winston-NodeJS"],
    json:true
});

winston.log('info',"Hello World from Node.js!");

// This captures and evaluates any message sent to the bot as a DM
// or sent to the bot in the form "@bot message" and passes it to
// Botkit Studio to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
// You can tie into the execution of the script using the functions
// controller.studio.before, controller.studio.after and controller.studio.validate
if (process.env.studio_token) {
  controller.on('message_received', (bot, message) => {
    debug('studio running ', message);
    controller.studio
      .runTrigger(bot, message.text, message.user, message.channel, message)
      .then((convo) => {
        console.log('Ran studio trigger');
        if (!convo) {
          console.log('No convo found');
          // web bot requires a response of some kind!
          // bot.reply(message, "OK")
          // no trigger was matched
          // If you want your bot to respond to every message,
          // define a 'fallback' script in Botkit Studio
          // and uncomment the line below.
          // controller.studio.run(
          //   bot,
          //   "fallback",
          //   message.user,
          //   message.channel,
          //   message
          // )
          // bot.reply(message, "OK")
        } else {
          // set variables here that are needed for EVERY script
          // use controller.studio.before('script') to set variables specific to a script
          console.log('convo found');
        }
      })
      .catch((err) => {
        bot.reply(message, `I experienced an error with a request to Botkit Studio: ${err}`);
        debug('Botkit Studio: ', err);
      });
  });
} else {
  console.log('~~~~~~~~~~');
  console.log('NOTE: Botkit Studio functionality has not been enabled');
  console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/');
}

function usage_tip() {
  console.log('~~~~~~~~~~');
  console.log('Botkit Starter Kit');
  console.log('Execute your bot application like this:');
  console.log('PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
  console.log('Get a Botkit Studio token here: https://studio.botkit.ai/');
  console.log('~~~~~~~~~~');
}
