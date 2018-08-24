const twilio = require('twilio');
const moment = require('moment-timezone');

const getAllActiveUsers = require('./../graphcool/queries/get_all_enrolled_users')
const getCurrentEvent = require('./../graphcool/queries/get_current_event')    

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];
const randomNumber = Math.floor(Math.random() * greetings.length);
const greeting = greetings[randomNumber];

const ctas = ["Check it out!", "Don't miss it!", "Don't miss out!", 'Be sure to join!', 'Are you ready?'];
const randomNumbers = Math.floor(Math.random() * ctas.length);
const cta = ctas[randomNumbers];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = async function() {

  const sendAllReminders = async (allUsers, currentEvent) => {

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

    message.currentEvent = `${moment.tz(currentEvent.date, "America/Los_Angeles").fromNow()}, ${currentEventTrainer} is ${currentEventMessage}${currentEvent.type === 'GeneralQA' ? "." : ""}${currentEvent.type === 'Series' ? `"${currentEvent.series.title}: ${currentEvent.title}".` : ""}${currentEvent.type === 'Other' ? `"${currentEvent.title}".` : ""} ${cta}`

    allUsers.map(u => {
      const { phoneSMS, firstName, attendedTalks } = u 

      if (!phoneSMS) {
        return null
      }

      client.messages.create({
        body: `${greeting} ${firstName + ","} ${message.currentEvent}`,
        to: `+1${phoneSMS}`,
        from: '+17874884263' 
      })
      .then((message) => console.log(message.sid, `${greeting}, ${firstName}! ${message.currentEvent}`));

      });
  }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const currentEvent = await getCurrentEvent()
      console.log("Current event is, ", currentEvent)
      const allReports = await sendAllReminders(allUsers, currentEvent)
      console.log("All reminders for Live Talk sent ", allReports)
      return allReports
    } catch (err) {
      console.log("Error with Live Talk reminder", err)
      return err
    }
}
