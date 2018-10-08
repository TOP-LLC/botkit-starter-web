const schedule = require('node-schedule-tz');
const twilio = require('twilio');
const moment = require('moment-timezone');

const getAllActiveUsers = require('../graphcool/queries/get_all_enrolled_users');
const getActiveHabit = require('../graphcool/queries/get_active_habit');

const getDailyHabit = require('../functions/dailyHabit');
const getDailySchedule = require('../functions/dailySchedule');
const getDailyChallenge = require('../functions/dailyChallenge');
const greetings = ["Greetings", 'Hey', 'Buenos dias', 'Salutations', 'Hola', 'Aloha', "Hello", "Good day"];
const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = async function() {

// Run every weekday morning at 9:00 am EST
return schedule.scheduleJob('daily report', '00 12 * * 1-5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running daily notifications `, new Date())

  /*
    1. Get allUsers
    2. Get current challenge info
    3. Get current habit info
    4. Get schedule info
    5. If M or F, add challenge
    6. If M, W, T, F, add schedule
    7. Add Habit
    8. Send email with all
    9. Send text with all
  */

    const sendAllReminders = async (allUsers, dailyHabitMessage, dailyChallengeMessage, dailyScheduleMessage) => {

      const dow = moment().date()
      let text = ""
      let html = ""

      if (dow === 1 || dow === 5) {
        console.log("Creating message for ", moment().day(dow))
      } else if (dow === 2) {
        console.log("Creating message for ", moment().day(dow))
      } else if (dow === 3 || dow === 4) {
        console.log("Creating message for ", moment().day(dow))
      } else {
        return console.log("No notifications scheduled because today is ", moment().date(dow))
      }
      
      allUsers.map(u => {
        const { phoneSMS, seriesChallengeSubmissions, email } = u

        /* 
          Monday: Challenge, Schedule, Habit (All)
          Tuesday: Habit (Habit)
          Wednesday: Schedule, Habit (Schedule)
          Thursday: Schedule, Habit (Schedule)
          Friday: Challenge, Schedule, Habit (All)
        */

        client.messages.create({
          body: `${greeting}! ${dailyHabitMessage}`,
          to: `+1${phoneSMS}`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid));
        });

        client.messages.create({
          body: `${greeting}, ${_.includes(attendedTalks, o => o.id === currentEvent.id) ? firstName + "! " : firstName + ", " + message.prevEvent + " And"} ${message.currentEvent}`,
          to: `+1${phoneSMS}`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid, `${greeting}, ${firstName}! ${message.prevEvent} ${message.currentEvent}`));

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: 'support@topmortgage.org',
          subject: 'TOP mortgage training Daily Live Schedule',
          text: `${greeting}, ${firstName + ", " + message.prevEvent + " And"} ${message.currentEvent}`,
          html: `<p>${greeting}, ${_.includes(attendedTalks, o => o.id === currentEvent.id) ? firstName + "! " : firstName + ", " + message.prevEvent}</p> <p>And ${message.currentEvent}</p> <p><a href="https://www.topmortgage.co">Log in now to check it all out!<a></p>`,
        };
        sgMail.send(msg).then(message => console.log(message));

        client.messages.create({
          body: `${greeting}! ${challengeMessage ? 'You already submitted your challenge. Nice work!' : challengeSet}`,
          to: `+1${phoneSMS}`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid));
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      dailyChallengeMessage = await getDailyChallenge()
      dailyScheduleMessage = await getDailySchedule()
      dailyHabitMessage = await getDailyHabit()
      const allReports = await sendAllReminders(allUsers, dailyHabitMessage, dailyChallengeMessage, dailyScheduleMessage)
      console.log("Completed cron job all ", allReports)
      return allReports
  
    } catch (err) {
      console.log("Error with daily habit messaging", err)
      return err
    }

});

}
