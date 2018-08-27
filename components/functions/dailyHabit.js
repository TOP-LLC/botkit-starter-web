const getActiveHabit = require('../graphcool/queries/get_active_habit');

module.exports = async function() {

    let dailyHabitMessage = `Today's habit to work on: ${activeHabit.message}`

    try {
      const activeHabit = await getActiveHabit()
      console.log("Active habit is ", activeHabit)
      return dailyHabitMessage
  
    } catch (err) {
      console.log("Error with daily habit messaging", err)
      return err
    }

}
