const schedule = require('node-schedule-tz');
const twilio = require('twilio');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info')
const getAllTasksData = require('./../graphcool/queries/get_all_tasks_data')

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];

const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = function(controller) {

// Run every weekday morning at 10:30 am EST
return schedule.scheduleJob('daily report', '30 14 * * 1-5 *', 'Atlantic/Reykjavik', function() {

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

    const sendAllReminders = async (allUsers, allData) => {

      let {} = allData

      return allUsers.map(u => {
        const { phoneSMS, challenge, dailyHabits } = u

        let challengeMessage = challenge.status === 'Submitted' ? false : true
        let challengeSet = `Remember to keep working on your challenge for this Talk series due ${challenge.date}. Today's challenge set: ${challenge.set}`
        let dailyHabitMessage = `And here's one of today's habits to build: ${dailyHabits}`

        client.messages.create({
          body: `${greeting}! ${challengeMessage ? challengeSet : 'You already submitted your challenge. Nice work!'} ${dailyHabitMessage}`,
          to: `+1${phoneSMS}`,
          from: '+17874884263 ' 
        })
        .then((message) => console.log(message.sid));

        });
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const allData = await getAllTasksData()
      console.log("All report data is ", allData)
      const allReports = await sendAllReminders(allUsers, allData)
      return allReports
  
    } catch (err) {
      console.log("Error with daily habits and challenge messaging", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result))

});

}
