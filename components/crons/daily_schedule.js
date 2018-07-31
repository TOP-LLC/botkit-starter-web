const schedule = require('node-schedule-tz');
const twilio = require('twilio');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info')
const getAllScheduleData = require('./../graphcool/queries/get_all_schedule_data')

const greetings = ["What's up", 'Hey', 'Boom', 'Buenos dias', 'Yo', 'Listen up', 'Salutations', 'Hola', 'Aloha'];
const randomNumber = Math.floor(Math.random() * greetings.length);
const greeting = greetings[randomNumber];

const accountSid = process.env.TWILIO_ACCOUNTSID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken);

module.exports = function(controller) {

// Run every weekday morning at 10 am EST
return schedule.scheduleJob('daily schedule', '0 14 * * 1-5 *', 'Atlantic/Reykjavik', function() {

  /*
    1. Every weekday morning at 10 am EST
    2. Get all active users 
    3. Get all upcoming events
    4. Get yesterday's event details
    5. Send to Twilio
    6. Repeat for each user

  */

  const runEverything = async () => {

    const getAllReportData = async () => {
      // query all event data

      return ({data})
    }

    const sendAllReminders = async (allUsers, allData) => {

      const {prevEvent, upcomingEvent} = allData

      let message = {}
      let upcomingEventMessage = ''

      switch (upcomingEvent.type) {
        case "Talk":
        upcomingEventMessage = 'continuing his TOP Talk series on '
        break;
        case "Booster":
        upcomingEventMessage = 'hosting a Booster on '
        break;
        case "Office Hours":
        upcomingEventMessage = 'available for Office Hours '
        break;
        default:
        upcomingEventMessage = false
        }

      message.prevEvent = `Yesterday, ${prevEvent.trainer} hosted ${prevEvent.type === 'Office Hours' ? 'an' : 'a'} ${prevEvent.type} on ${prevEvent.title}.`
      message.upcomingEvent = `${upcomingEvent.formattedDate}, ${upcomingEvent.trainer} is ${upcomingEventMessage} ${upcomingEvent.title} @ ${upcomingEvent.date}. Check it out!`

      allUsers.map(u => {
        const { phoneSMS, firstName } = u 

        client.messages.create({
          body: `${greeting}, ${firstName}! ${message}`,
          to: `+1${phoneSMS}`,
          from: '+17874884263 ' 
        })
        .then((message) => console.log(message.sid));

        });
    }

    try {
      const allUsers = await getAllActiveUsers()
      console.log("All users are ", allUsers)
      const allData = await getAllScheduleData()
      console.log("All report data is ", allData)
      const allReports = await sendAllReminders(allUsers, allData)
      return allReports
    } catch (err) {
      console.log("Error with weighin reminder notifications", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result)).catch((err) => console.log("Error running everything ", err)) 

});

}
