const schedule = require('node-schedule-tz');

const getPreLiveTalk = require('./../graphcool/queries/get_current_event')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_to_live_talk')

const sendReminders = require('./../functions/sendTwilio')

module.exports = async function() {

// Run every weekday morning at 11:30 am EST
return schedule.scheduleJob('daily schedule', '30 14 * * 1-5', 'Atlantic/Reykjavik', async function() {

  console.log(`Running TOP PreLive to Live cron job at `, new Date())

    try {
      const preLiveTalk = await getPreLiveTalk()
      console.log("Pre Live talk ", preLiveTalk)
      if (preLiveTalk.status === 'PreLive') {
        const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk.id)
        console.log("Updated PreLive Talk ", updatedPreLiveTalk)
        const allReminders = await sendReminders()
        console.log("Completed Prelive to Live with ", allReminders)
        return allReminders
      }
      return console.log("No Live event today ", preLiveTalk)
    } catch (err) {
      console.log("Error with Live cron job ", err)
      return err
    }

});

}
