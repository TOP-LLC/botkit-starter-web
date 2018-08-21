const schedule = require('node-schedule-tz');

const getPostLiveTalk = require('./../graphcool/queries/get_postlive_talk')
const getNextTalk = require('./../graphcool/queries/get_next_prelive_talk')   
const getAllHabits = require('./../graphcool/queries/get_all_habits')
const getActiveHabit = require('./../graphcool/queries/get_active_habit')

const updateActiveHabit = require('./../graphcool/mutations/update_active_habit')
const updateNextHabit = require('./../graphcool/mutations/update_next_habit') 
const updatePostLiveTalk = require('./../graphcool/mutations/update_postlive_talk')
const updatePreLiveTalk = require('./../graphcool/mutations/update_prelive_talk')

module.exports = async function() {

// Run every weekday morning at 10 am EST
return schedule.scheduleJob('daily schedule', '0 6 * * 4,6', 'Atlantic/Reykjavik', async function() {

  console.log(`Running TOP Live Update cron job at `, new Date())

  /*
    1. Get PostLive Talk and set current to false
    2. Get next PreLive Talk and set current to true
    3. Get allHabits
    4. Set active habit to false and set random habit to true
  */

    try {
      const postLiveTalk = await getPostLiveTalk()
      console.log("Post Live talk ", postLiveTalk)
      if (postLiveTalk.length !== 0) {
        const updatedPostLiveTalk = await updatePostLiveTalk(postLiveTalk[0].id)
        console.log("Updated PostLive Talk ", updatedPostLiveTalk)
        const preLiveTalk = await getNextTalk()
        console.log("Pre Live Talk ", preLiveTalk)
        const updatedPreLiveTalk = await updatePreLiveTalk(preLiveTalk[0].id)
        console.log("Updated PreLive Talk ", updatedPreLiveTalk)
        return updatedPreLiveTalk
      }
      return console.log("No Talk to Update", new Date())
    } catch (err) {
      console.log("Error with new PreLive Talk ", err)
      return err
    }

});

}
