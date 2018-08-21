const schedule = require('node-schedule-tz');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');
const _ = require('lodash');
const moment = require('moment');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info');
const getCurrentChallenge = require('./../graphcool/queries/get_current_challenge');
const getAllReminders = require('./../graphcool/queries/get_all_reminders');

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];

const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = async function() {

// Run every weekday morning at 8:30 am EST
return schedule.scheduleJob('daily report', '30 12 * * 1,3,5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running daily habits and challenge cron job at `, new Date())

  /*
    1. Every weekday morning at 10:30 am
    2. Get all active users 
    3. Get current challenge
    4. Get daily tasks 
    5. Get yesterday's event details
    6. Send to Twilio
    7. Repeat for each user
  */

    const sendAllReminders = async (allUsers, currentChallenge, allReminders) => {

        const formattedDates = allReminders.map(reminder => {
          console.log("Reminder date before is ", reminder.date)
          reminder.date = reminder.date.slice(0, 10)
          console.log("Reminder date is ", reminder.date)
          return reminder
        })
        const currentReminder = _.find(formattedDates, o => o.date === moment().format("YYYY-MM-DD"))
        console.log("Current reminder is ", currentReminder)

      return allUsers.map(u => {
        const { phoneSMS, seriesChallengeSubmissions, email, firstName } = u

        let challengeMessage = _.includes(seriesChallengeSubmissions, o => o.id === currentChallenge.id)
        let challengeSet = `Your challenge: "${currentChallenge.description}" is due ${moment(currentChallenge.dueDate).fromNow()}. Today's challenge tip: ${currentReminder.message}`

        client.messages.create({
          body: `${greeting}! ${challengeMessage ? 'You already submitted your challenge. Nice work!' : challengeSet}`,
          to: `+19517647045`,
          from: '+17874884263' 
        })
        .then((message) => console.log(message.sid));

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: 'support@topmortgage.co',
          subject: 'TOP mortgage training Daily Schedule',
          text: `${greeting} ${firstName}! ${challengeMessage ? 'You already submitted your challenge. Nice work!' : challengeSet}`,
          html: `<p>${greeting}, ${firstName}!</p> <p>${challengeMessage ? 'You already submitted your challenge. Nice work!</p>' : `Your challenge: "<em>${currentChallenge.description}</em>" is due ${moment(currentChallenge.dueDate).fromNow()} <a href="mailto:support@topmortgage.org">Email us</a> to submit it.</p><p><strong>Today's challenge tip</strong>: ${currentReminder.message}</p>`}`,
        };
        sgMail.send(msg).then(message => console.log(message));
        });
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const currentChallenge = await getCurrentChallenge()
      const allReminders = await getAllReminders()
      const allReports = await sendAllReminders(allUsers, currentChallenge, allReminders)
      console.log("Completed cron job all ", allReports)
      return allReports
  
    } catch (err) {
      console.log("Error with daily habits and challenge messaging", err)
      return err
    }

});

}
