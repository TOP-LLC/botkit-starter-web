module.exports = function(controller) {
  // Before the "tacos" script runs, set some extra template tokens like "special" and "extras"
  controller.studio.before("test", function(convo, next) {
    console.log("Heard test with convo")

    next()
  })
}
