const schedule = require('node-schedule-tz');
const twilio = require('twilio');
const moment = require('moment');
const _ = require('lodash');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info')
const getCurrentEvent = require('./../graphcool/queries/get_current_event')   
const getPrevEvent = require('./../graphcool/queries/get_prev_event')   

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];
const randomNumber = Math.floor(Math.random() * greetings.length);
const greeting = greetings[randomNumber];

const ctas = ["Check it out!", "Don't miss it!", 'Set your calendar!', 'Block off the time!', "Don't miss out!", 'Be sure to join!', 'Are you ready?'];
const randomNumbers = Math.floor(Math.random() * ctas.length);
const cta = ctas[randomNumbers];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = function() {

// Run every weekday morning at 10 am EST
return schedule.scheduleJob('daily schedule', '26 15 * * 1-5', 'Atlantic/Reykjavik', function() {

  /*
    1. Every weekday morning at 10 am EST
    2. Get all active users 
    3. Get all current events
    4. Get yesterday's event details
    5. Send to Twilio
    6. Repeat for each use
  */

  const runEverything = async () => {

    const sendAllReminders = async (allUsers, prevEvent, currentEvent) => {

      let message = {}
      let currentEventMessage = ''

      switch (currentEvent.type) {
        case "Series":
        currentEventMessage = 'continuing his TOP Talk series on'
        break;
        case "Booster":
        currentEventMessage = 'hosting a Booster on'
        break;
        case "GeneralQA":
        currentEventMessage = 'available for Office Hours'
        break;
        default:
        currentEventMessage = 'training on'
        }

      message.prevEvent = `${moment(prevEvent.date).fromNow()}, ${prevEvent.trainer.firstName} hosted ${prevEvent.type === 'Office Hours' ? 'an' : 'a'} ${prevEvent.type} on ${prevEvent.title}.`
      message.currentEvent = `${moment(currentEvent.date).calendar()} EST, ${currentEvent.trainer.firstName} is ${currentEventMessage} ${currentEvent.type === 'Series' ? currentEvent.title + "." : currentEvent.type === 'Booster' ? currentEvent.title + "." : "." } ${cta}`

      allUsers.map(u => {
        const { phoneSMS, firstName, attendedTalks } = u 

        client.messages.create({
          body: `${greeting}, ${_.includes(attendedTalks, o => o.id === currentEvent.id) ? firstName + "! " : firstName + "! " + message.prevEvent + " And"} ${message.currentEvent}`,
          to: `+19517647045`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid, `${greeting}, ${firstName}! ${message.prevEvent} ${message.currentEvent}`));

        });
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const prevEvent = await getPrevEvent()
      console.log("Previous event is, ", prevEvent)
      const currentEvent = await getCurrentEvent()
      console.log("Current event is, ", currentEvent)
      const allReports = await sendAllReminders(allUsers, prevEvent, currentEvent)
      return allReports
    } catch (err) {
      console.log("Error with daily schedule reminder ", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result)).catch((err) => console.log("Error running everything in daily schedule ", err)) 

});

}
