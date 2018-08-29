const schedule = require('node-schedule-tz');
const twilio = require('twilio');

const getAllActiveUsers = require('../graphcool/queries/get_all_enrolled_users');
const getActiveHabit = require('../graphcool/queries/get_active_habit');

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];

const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = async function() {

// Run every weekday morning at 9:00 am EST
return schedule.scheduleJob('daily report', '30 16 * * 1-5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running daily habits cron job at `, new Date())

  /*
    1. Every weekday morning at 10:30 am
    2. Get all active users 
    3. Get current challenge
    4. Get daily tasks 
    5. Get yesterday's event details
    6. Send to Twilio
    7. Repeat for each user
  */

    const sendAllReminders = async (allUsers, activeHabit) => {

      allUsers.map(u => {
        const { phoneSMS, seriesChallengeSubmissions, email } = u

        if (!phoneSMS) {
          return null
        }

        let dailyHabitMessage = `Today's habit to work on: ${activeHabit.message}`

        client.messages.create({
          body: `${greeting}! ${dailyHabitMessage}`,
          to: `+1${phoneSMS}`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid));
        });
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const activeHabit = await getActiveHabit()
      const allReports = await sendAllReminders(allUsers, activeHabit)
      console.log("Completed cron job all ", allReports)
      return allReports
  
    } catch (err) {
      console.log("Error with daily habit messaging", err)
      return err
    }

});

}
