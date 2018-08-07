const twilio = require('twilio');
const moment = require('moment');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info')
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

        console.log("All users are ", allUsers)

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

      message.currentEvent = `In ${moment(currentEvent.date).fromNow()}, ${currentEvent.trainer.firstName} is ${currentEventMessage} ${currentEvent.type === 'Series' ? currentEvent.title + "." : currentEvent.type === 'Booster' ? currentEvent.title + "." : "." } ${cta}`

      allUsers.map(u => {
        const { phoneSMS, firstName } = u 

        client.messages.create({
          body: `${greeting}, ${firstName + "!"} ${message.currentEvent}`,
          to: `+19517647045`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid, `${greeting}, ${firstName + "!"} ${message.currentEvent}`));
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
