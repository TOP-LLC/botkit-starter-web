const schedule = require('node-schedule')
const _ = require('underscore')
const moment = require('moment')
const rp = require('request-promise');

const getAllActiveUsers = require('./../graphcool/queries/get_all_active_users_info')

// Creating random greeting

const greetings = ["Greetings", 'Hey', 'Buenos dias', 'Salutations', 'Hola', 'Aloha', "Hello", "Good day"];

const randomNumber = Math.floor(Math.random() * greetings.length);

const greeting = greetings[randomNumber];

module.exports = function(controller) {

  console.log("Running weigh-in notifications")

// Run every Friday at 8am EST
return schedule.scheduleJob('0 9 * * 5', function() {

  const runEverything = async () => {

    try {
      console.log("Get all active users")
      const allUsers = await getAllActiveUsers()
      console.log("All users are: ", allUsers)

    const sendAllReminders = async () => {

      allUsers.map(u => {
        const { id, phoneSMS, firstName, lastName } = u

        const bot = controller.spawn({})

        controller.studio
          .get(bot, "Weigh In Weekly Reminder", id, `Bot-${id}`)
          .then(convo => {
            convo.setVar("firstName", firstName)
            convo.setVar("greeting", greeting)

            convo.activate()
          })

        });
    }
  
    const allNotifications = await sendAllReminders()

    console.log("Notifications are: ", allNotifications)
    
    return allNotifications
  
    } catch (err) {
      console.log("Error with weighin reminder notifications", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result))

});
}
