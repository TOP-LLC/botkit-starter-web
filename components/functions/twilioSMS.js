const debug = require('debug')('botkit:sendSMS');
const rp = require('request-promise');
const accountSid = 'AC2b75d82f0f32544863af8fc80517370a';
const authToken = '8f14e1a57a1d084c051023a8114092e4';
const client = require('twilio')(accountSid, authToken);

module.exports = (message, phone) => {
  debug('Running twilio SMS', message, phone);

  client.messages
    .create({
        to: `+1${phone}`,
        from: '+17873034288',
        body: message.text,
    })
    .then(message => console.log(`Message SID ${message.sid}`))
    .catch((err) => console.log(err));
};
