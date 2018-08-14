const schedule = require('node-schedule-tz');

const getPreLiveTalk = require('./../graphcool/queries/get_current_event')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_to_live_talk')

const sendReminders = require('./../functions/sendTwilio')

module.exports = async function() {

// Run every weekday morning at 10 am EST
return schedule.scheduleJob('daily schedule', '20 16 * * 1-5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running TOP PreLive to Live cron job at `, new Date())

    try {
      const preLiveTalk = await getPreLiveTalk()
      console.log("Pre Live talk ", preLiveTalk)
      const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk.id)
      console.log("Updated PreLive Talk ", updatedPreLiveTalk)
      const allReminders = await sendReminders()
      console.log("Completed Prelive to Live with ", allReminders)
      return allReminders
    } catch (err) {
      console.log("Error with Live cron job ", err)
      return err
    }

});

}
