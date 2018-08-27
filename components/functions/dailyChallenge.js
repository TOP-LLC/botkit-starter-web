const _ = require('lodash');
const moment = require('moment-timezone');

const getCurrentChallenge = require('./../graphcool/queries/get_current_challenge');
const getAllReminders = require('./../graphcool/queries/get_all_reminders');

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];

const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

module.exports = async function() {

  try {
    const currentChallenge = await getCurrentChallenge()
    const allReminders = await getAllReminders()
    if (currentChallenge.data && allReminders.data) {
      const formattedDates = allReminders.map(reminder => {
        console.log("Reminder date before is ", reminder.date)
        reminder.date = reminder.date.slice(0, 10)
        console.log("Reminder date is ", reminder.date)
        return reminder
      })
      const currentReminder = _.find(formattedDates, o => o.date === moment.utc().format("YYYY-MM-DD"))
      console.log("Current reminder is ", currentReminder)
    
      let challengeMessage = _.includes(seriesChallengeSubmissions, o => o.id === currentChallenge.id)
      let challengeSet = `Your challenge: "${currentChallenge.description}" is due ${moment.tz(currentChallenge.dueDate, "America/Los_Angeles").calendar()}. Today's challenge tip: ${currentReminder.message}`
    
      let message = `${greeting}! ${challengeMessage ? 'You already submitted your challenge. Nice work!' : challengeSet}`
      return message
    }
  } catch (err) {
    console.log("Error with getting challenge and challenge tip", err)
    return err
  }

}
