// const schedule = require('node-schedule-tz');

const getLiveTalk = require('./../graphcool/queries/get_current_event')
const updateLiveTalk = require('./../graphcool/mutations/update_live_to_past_talk')

module.exports = async function() {

  console.log(`Running Live Event to Past at `, new Date())

    try {
      const liveTalk = await getLiveTalk()
      console.log("Live talk ", liveTalk)
      const updatedLiveTalk = await updateLiveTalk(liveTalk.id)
      console.log("Updated Live Talk ", updatedLiveTalk)
      return updatedLiveTalk
    } catch (err) {
      console.log("Error with Live to Past cron job ", err)
      return err
    }

}
