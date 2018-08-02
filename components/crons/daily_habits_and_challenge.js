const schedule = require('node-schedule-tz');
const twilio = require('twilio');
const _ = require('lodash');
const moment = require('moment');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info');
const getCurrentChallenge = require('./../graphcool/queries/get_current_challenge');
const getAllReminders = require('./../graphcool/queries/get_all_reminders');
const getActiveHabit = require('./../graphcool/queries/get_active_habit');

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];

const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = function() {

// Run every weekday morning at 10:30 am EST
// return schedule.scheduleJob('daily report', '30 14 * * 1-5 *', 'Atlantic/Reykjavik', function() {

  /*
    1. Every weekday morning at 10:30 am
    2. Get all active users 
    3. Get current challenge
    4. Get daily tasks 
    5. Get yesterday's event details
    6. Send to Twilio
    7. Repeat for each user
  */

  const runEverything = async () => {

    const sendAllReminders = async (allUsers, currentChallenge, allReminders, activeHabit) => {

        const formattedDates = allReminders.map(reminder => {
          console.log("Reminder date before is ", reminder.date)
          reminder.date = reminder.date.slice(0, 10)
          console.log("Reminder date is ", reminder.date)
          return reminder
        })
        const currentReminder = _.find(formattedDates, o => o.date === moment().format("YYYY-MM-DD"))
        console.log("Current reminder is ", currentReminder)

      return allUsers.map(u => {
        const { phoneSMS, seriesChallengeSubmissions } = u

        let challengeMessage = _.includes(seriesChallengeSubmissions, o => o.id === currentChallenge.id)
        let challengeSet = `Remember to keep working on your challenge to ${currentChallenge.description} for the current Talk series on ${currentChallenge.talk.title} due sometime. And here's today's challenge reminder: ${currentReminder.message}`
        let dailyHabitMessage = `And here's one of today's habits to build: ${activeHabit.message}`

        client.messages.create({
          body: `${greeting}! ${challengeMessage ? 'You already submitted your challenge. Nice work!' : challengeSet} ${dailyHabitMessage}`,
          to: `+19517647045`,
          from: '+17874884263 ' 
        })
        .then((message) => console.log(message.sid));

        });
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const currentChallenge = await getCurrentChallenge()
      const allReminders = await getAllReminders()
      const activeHabit = await getActiveHabit()
      const allReports = await sendAllReminders(allUsers, currentChallenge, allReminders, activeHabit)
      return allReports
  
    } catch (err) {
      console.log("Error with daily habits and challenge messaging", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result))

// });

}
