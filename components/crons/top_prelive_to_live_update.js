const schedule = require('node-schedule-tz');
const _ = require('lodash');
const moment = require('moment-timezone');
const twilio = require('twilio');
// const moment = require('moment');
const sgMail = require('@sendgrid/mail');

const greetings = ["Greetings", 'Hey', 'Buenos dias', 'Salutations', 'Hola', 'Aloha', "Hello", "Good day"];
const randomNumber = Math.floor(Math.random() * greetings.length);
const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = new twilio(accountSid, authToken);

const getPreLiveTalk = require('./../graphcool/queries/get_current_event')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_to_live_talk')
const getAllActiveUsers = require('./../graphcool/queries/get_all_enrolled_users')

// const sendReminders = require('./../functions/sendTwilio')

module.exports = async function() {

// Run every weekday morning at 2:30 pm EST
return schedule.scheduleJob('daily schedule', '30 13 * * 3,4,5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running TOP PreLive to Live cron job at `, new Date())

  const sendNotifications = async (currentEvent, allUsers) => {
    let message = {}
    let currentEventMessage = ''
    let currentEventTrainer = currentEvent.trainer ? currentEvent.trainer.firstName : "your TOP trainer"

    switch (currentEvent.type) {
      case "Series":
      currentEventMessage = 'continuing his TOP Live Talk series'
      break;
      case "Other":
      currentEventMessage = 'hosting a Business Booster'
      break;
      case "GeneralQA":
      currentEventMessage = 'available for Office Hours'
      break;
      default:
      currentEventMessage = 'training on'
      }

    message.currentEvent = `${moment.tz(currentEvent.date, "America/Los_Angeles").fromNow()}, ${currentEventTrainer} is ${currentEventMessage} ${currentEvent.type === 'GeneralQA' ? "." : ""}${currentEvent.type === 'Series' ? `"${currentEvent.series.title}: ${currentEvent.title}".` : ""}${currentEvent.type === 'Other' ? `"${currentEvent.title}".` : ""} Don't miss it!`

    return allUsers.map(u => {
      const { phoneSMS, firstName, email } = u 

      if (!phoneSMS) {
        return null
      }

      client.messages.create({
        body: `Hey ${firstName}, ${message.currentEvent}`,
        to: `+1${phoneSMS}`,
        from: '+17874884263' 
      })
      .then((message) => console.log(message.sid, `${firstName}! ${message.currentEvent}`));

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: 'support@topmortgage.org',
        subject: `${currentEvent.title} starts soon!`,
        text: `${greeting} ${firstName + ", "} ${message.currentEvent}`,
        html: `<p>${greeting} ${firstName + ", "} ${message.currentEvent}</p> <p><a href="https://www.topmortgage.co">Join now!</a></p>`, 
      };
      sgMail.send(msg).then(message => console.log(message.body));
    });
  };

    try {
      const preLiveTalk = await getPreLiveTalk()
      console.log("Pre Live talk ", preLiveTalk)
      let formattedDate = preLiveTalk.date.slice(0, 10)
      let isToday = formattedDate === moment().format("YYYY-MM-DD")
      console.log("Is Today? ", isToday)
      if (isToday) {
        const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk.id)
        console.log("Updated PreLive Talk ", updatedPreLiveTalk)
        const allUsers = await getAllActiveUsers()
        const sentNotifications = await sendNotifications(preLiveTalk, allUsers)
        return {data: {sentNotifications, updatedPreLiveTalk}}
      }
      return console.log("No Live event today ", preLiveTalk)
    } catch (err) {
      console.log("Error with Live cron job ", err)
      return err
    }

});

}
