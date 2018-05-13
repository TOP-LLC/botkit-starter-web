const schedule = require('node-schedule')
const _ = require('underscore')
const moment = require('moment')
const rp = require('request-promise');

const getAllTouchpointAppointments = require('./../graphcool/queries/get_all_touchpoint_appointments')

module.exports = function(controller) {

  console.log("Running touchpoint appointment notifications")

// Run every 25 minutes of every hour
return schedule.scheduleJob('*/5 * * * *', function() {

  // Pull in all touchpointAppointments that have a client and a status of Pending or Accepted

  const runEverything = async () => {

    try {
      console.log("Get all touchpoint appointments")
      const allTouchpointAppointments = await getAllTouchpointAppointments()
  
      console.log("All touchpoint appointments ", allTouchpointAppointments)
    
    // Check the date for each touchpointAppointment

    const getAllNotifications = async () => {

      allTouchpointAppointments.map(tp => {
        const { date, id, status, client, trainer, reminder } = tp

        console.log("Date is ", date)
        const now = moment.utc()
        console.log("Now is ", now)
        const formattedDate = moment.utc(date)
        const diff = formattedDate.diff(now, "minutes")
        console.log(diff)
    
        // If after now, check if is within the next 59 minutes
        if (diff > 0) {
          const withinHour = (diff < 60 && diff > 11)
          console.log("WithinHour is ", withinHour)
          const touchpointTime = diff < 11
          console.log("Touchpoint Time is ", touchpointTime)
          if (withinHour && !touchpointTime && reminder < 1) {
            // Send hour notification
              console.log('Touchpoint is within the next hour');
          
              const options = {
                method: 'POST',
                uri: 'http://thetopsystem.com/touchpointreminder',
                body: {
                  touchPoint: tp
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
    
          } else if (touchpointTime && reminder == 1) {
            // Send touchpointTime notification and set touchpointStatus to TouchpointTime
                console.log('Touchpoint Time is now!');
          
                const options = {
                  method: 'POST',
                  uri: 'http://thetopsystem.com/touchpointtime',
                  body: {
                    touchPoint: tp
                  },
                  json: true,
                };
            
                rp(options)
                  .then((parsedBody) => {
                    console.log('Posted successfully: ', parsedBody);
                    return parsedBody;
                  })
                  .catch((err) => {
                    console.log('Error posting: ', err);
                    return err;
                  });
    
          }
          console.log('No touchpoints within the next hour');
          return null
        };
        console.log('Touchpoint  is prior to now');
        return null
      })

    }
  
    const allNotifications = await getAllNotifications()

    console.log("Notifications are: ", allNotifications)
    
    return allNotifications
  
    } catch (err) {
      console.log("Error with touchpoint appointment notifications", err)
      return err
    }

  }
  return runEverything().then(result => console.log(result))

});
}
