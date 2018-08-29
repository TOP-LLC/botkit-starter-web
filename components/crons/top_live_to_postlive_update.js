// const schedule = require('node-schedule-tz');

const getLiveTalk = require('../graphcool/queries/get_current_event')
const updateLiveTalk = require('../graphcool/mutations/update_live_to_postlive_talk')
const updatePreLiveChallenge = require('../graphcool/mutations/update_prelive_challenge')
const updatePostLiveChallenge = require('../graphcool/mutations/update_postlive_challenge')
const getCurrentChallenge = require('../graphcool/queries/get_current_challenge')

module.exports = async function() {

  console.log(`Running Live Event to Past at `, new Date())

    try {
      const liveTalk = await getLiveTalk()
      console.log("Live talk ", liveTalk)
      const updatedLiveTalk = await updateLiveTalk(liveTalk.id)
      console.log("Updated Live Talk to PostLive", updatedLiveTalk)
      if (updatedLiveTalk.data.updateTalk.type === 'Series') {
        // Get most recent Past Talk that is a Series
        console.log("Talk is a series, update challenges")
        const pastTalkChallenge = getCurrentChallenge()
        console.log("Past Talk challenge is ", pastTalkChallenge)
        const updatedPastChallenge = await updatePostLiveChallenge(pastTalkChallenge.id)
        const updatedPostLiveChallenge = await updatePreLiveChallenge(updatedLiveTalk.seriesChallenge.id)
        console.log("Updated challenges ", [updatedPastChallenge, updatedPostLiveChallenge])
        return [updatedPastChallenge, updatedPostLiveChallenge]
      }
      return updatedLiveTalk
    } catch (err) {
      console.log("Error with Live to Past cron job ", err)
      return err
    }

}
