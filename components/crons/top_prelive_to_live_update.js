const getPreLiveTalk = require('./../graphcool/queries/get_current_event')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_to_live_talk')

module.exports = async function() {

// Run every weekday morning at 10 am EST
return schedule.scheduleJob('daily schedule', '30 16 * * 1-5', 'Atlantic/Reykjavik', function() {

    try {
      const preLiveTalk = await getPreLiveTalk()
      console.log("Pre Live talk ", preLiveTalk)
      const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk.id)
      console.log("Updated PreLive Talk ", updatedPreLiveTalk)
      return updatePreLiveTalk
    } catch (err) {
      console.log("Error with Live cron job ", err)
      return err
    }

});

}
