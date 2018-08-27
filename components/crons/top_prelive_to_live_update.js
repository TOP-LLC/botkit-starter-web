const schedule = require('node-schedule-tz');
const _ = require('lodash');
const moment = require('moment-timezone');

const getPreLiveTalk = require('./../graphcool/queries/get_current_event')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_to_live_talk')

// const sendReminders = require('./../functions/sendTwilio')

module.exports = async function() {

// Run every weekday morning at 11:30 am EST
return schedule.scheduleJob('daily schedule', '30 14 * * 3,4,5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running TOP PreLive to Live cron job at `, new Date())

    try {
      const preLiveTalk = await getPreLiveTalk()
      console.log("Pre Live talk ", preLiveTalk)
      let formattedDate = preLiveTalk.date.slice(0, 10)
      const isToday = _.find(formattedDate, o => o.date === moment.utc().format("YYYY-MM-DD"))
      if (isToday) {
        const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk.id)
        console.log("Updated PreLive Talk ", updatedPreLiveTalk)
        return updatedPreLiveTalk
      }
      return console.log("No Live event today ", preLiveTalk)
    } catch (err) {
      console.log("Error with Live cron job ", err)
      return err
    }

});

}
