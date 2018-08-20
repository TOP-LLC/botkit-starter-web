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
return schedule.scheduleJob('daily schedule', '00 11 * * 1-5', 'Atlantic/Reykjavik', function() {

  console.log(`Running daily schedule cron job at `, new Date())

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
      let prevEventMessage = ''
      let prevEventTrainer = prevEvent.trainer ? prevEvent.trainer.firstName : "your TOP trainer"
      let currentEventTrainer = currentEvent.trainer ? currentEvent.trainer.firstName : "your TOP trainer"

      switch (currentEvent.type) {
        case "Series":
        currentEventMessage = 'continuing his TOP Live Talk series'
        break;
        case "Other":
        currentEventMessage = 'hosting a Business Booster'
        break;
        case "GeneralQA":
        currentEventMessage = 'available for Office Hours.'
        break;
        default:
        currentEventMessage = 'training on'
        }

      switch (prevEvent.type) {
        case "Series":
        prevEventMessage = 'continued his TOP Live Talk series '
        break;
        case "Other":
        prevEventMessage = 'hosted a Business Booster '
        break;
        case "GeneralQA":
        prevEventMessage = 'held an Office Hours live session'
        break;
        default:
        prevEventMessage = 'trained on'
        }

      message.prevEvent = `${moment(prevEvent.date).fromNow()}, ${prevEventTrainer} ${prevEventMessage}${prevEvent.type === 'GeneralQA' ? "." : ""}${prevEvent.type === 'Series' ? `"${prevEvent.series.title}: ${prevEvent.title}".` : ""}${prevEvent.type === 'Other' ? `"${prevEvent.title}".` : ""} Check the recording if you missed it!`
      message.currentEvent = `${moment(currentEvent.date).calendar()} EST, ${currentEventTrainer} is ${currentEventMessage} ${currentEvent.type === 'GeneralQA' ? "." : ""}${currentEvent.type === 'Series' ? `"${currentEvent.series.title}: ${currentEvent.title}".` : ""}${currentEvent.type === 'Other' ? `"${currentEvent.title}".` : ""} ${cta}`

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
      console.log("Finished with all schedules ", allReports)
      return allReports
    } catch (err) {
      console.log("Error with daily schedule reminder ", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result)).catch((err) => console.log("Error running everything in daily schedule ", err)) 

});

}
