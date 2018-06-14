const schedule = require('node-schedule')
const _ = require('underscore')
const moment = require('moment')
const rp = require('request-promise');

const getAllProgressCurrents = require('./../graphcool/queries/get_all_users_needs_challenges')

module.exports = function(controller) {

  console.log("Running Sprint completion notifications")

// Run every morning at 10 UTC on Monday, Wednesday, and Friday
let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [1, 3, 5 ];
rule.hour = 10;
rule.minute = 0;


return schedule.scheduleJob(rule, function() {

  // Query all users who are currently completing training

  const runEverything = async () => {

    try {
      console.log("Get all progress currents")
      const allProgressCurrents = await getAllProgressCurrents()
  
      console.log("All progress currents ", allProgressCurrents)
    
    // Check the elapsed completion time for current sprint

    const getAllNotifications = async () => {

      allProgressCurrents.map(pc => {
        const { sprintStart, sprint, cycle, session, challenges } = pc
        const { duration, title, number } = sprint

        console.log("Sprint Start Date is ", sprintStart)
        const now = moment.utc()
        console.log("Now is ", now)
        const formattedDate = moment.utc(sprintStart)
        const diff = (formattedDate.diff(now, "milliseconds") * 10)
        console.log(diff)
    
        // If diff is > duration, send a notification
        if (diff > duration) {
            // Send hour notification
              console.log('Elapsed time is 10x longer than expected duration');
          
              const options = {
                method: 'POST',
                uri: 'http://topmortgage.pagekite.me/sprintreminder',
                body: {
                  progressCurrent: pc
                },
                json: true,
              };
          
              return rp(options)
                .then((parsedBody) => {
                  console.log('Posted successfully: ', parsedBody);
                  return parsedBody;
                })
                .catch((err) => {
                  console.log('Error posting: ', err);
                  return err;
                });
    
          } 
        console.log('Sprint is within the duration, do not send a notification');
        return null
      })

    }
  
    const allNotifications = await getAllNotifications()

    console.log("Notifications are: ", allNotifications)
    
    return allNotifications
  
    } catch (err) {
      console.log("Error with sprint reminder notifications", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result))

});
}
