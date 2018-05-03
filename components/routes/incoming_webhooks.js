import trainingEventStart from "./../functions/trainingEventStart"

const queryUser = require("./../graphcool/queries/get_user_info")
const updateUserConvoPause = require("./../graphcool/queries/update_user_convo_pause")
const debug = require("debug")("botkit:incoming_webhooks")

module.exports = (webserver, controller) => {
  debug("Configured /botkit/receive url")
  webserver.post("/botkit/receive", (req, res) => {
    // respond to Slack that the webhook has been received.
    res.status(200)

    // Now, pass the webhook into be processed
    controller.handleWebhookPayload(req, res)
  })

  debug("Configured POSt /dashbotpause url for pausing bot for live takeover")
  webserver.post("/dashbotpause", (req, res) => {
    console.log("Received webhook for bot pausing")

    const { paused, userId } = req.body

    async function setConvoPause(code, state) {
      console.log("get user id started")

      try {
        const user = await queryUser(userId)
        console.log("User ID is ", user.id)
        const result = await updateUserConvoPause(user.id, paused)
        console.log("Result of updateUserConvoPause is ", result)
        return result
      } catch (err) {
        return console.log("Error in the async chain is ", err)
      }
    }

    console.log("Paused state and userId here: ", [paused, userId])

    return setConvoPause().then(result => {
      console.log("Completed user convo pause ", result)
      res.status(200)
      res.send("ok")
    })
  })

  debug("Configured /onboarstart url")
  webserver.post("/onboardstart", (req, res) => {
    debug("Running onboarding start", JSON.stringify(req.body))

    const { user } = req.body

    const bot = controller.spawn({})

    controller.studio
      .get(bot, "New Client Onboarding", user.id, `Bot-${user.id}`)
      .then(convo => {
        // crucial! call convo.activate to set it in motion
        convo.setVar("firstName", user.firstName)

        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /touchpointtime url")
  webserver.post("/touchpointtime", async (req, res) => {
    debug("Running touchpoint time event start", JSON.stringify(req.body))

    const { user } = req.body.data.TouchpointStatus.node

    const touchpointStatus = req.body.data.TouchpointStatus.node

    const { number, title } = touchpointStatus.user.progressCurrent.session

    const bot = controller.spawn({})

    controller.studio
      .get(
        bot,
        "Touchpoint Appointment Needs Booked",
        user.id,
        `Bot-${user.id}`
      )
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("greeting", "Boom")
        convo.setVar("number", number)
        convo.setVar("title", title)

        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  debug("Configured /trainingeventstart url")
  webserver.post("/trainingeventstart", async (req, res) => {
    debug("Running event start", JSON.stringify(req.body))

    const { schedule } = req.body.data.Event.node

    const event = req.body.data.Event.node

    const eventRes = await trainingEventStart(event)
    debug("Returned event data: ", eventRes)
    const { eventType, greeting, title, number } = eventRes

    const { user } = schedule

    const bot = controller.spawn({})

    const url = "/train/current"

    controller.studio
      .get(bot, "New Training Event Start", user.id, `Bot-${user.id}`)
      .then(convo => {
        convo.setVar("firstName", user.firstName)
        convo.setVar("type", eventType)
        convo.setVar("greeting", greeting)
        convo.setVar("title", title)
        convo.setVar("number", number)
        convo.setVar("url", url)

        convo.activate()
      })

    res.status(200)

    res.end("Got it!")
  })

  // Client submits a challenge for review
  debug("Configured /challengesubmit url")
  webserver.post("/challengemetricstatus", (req, res) => {
    // Challenge will either be intermittent or touchpoint. If Touchpoint, check if all challenges for given session are complete.

    debug("Received: ", JSON.stringify(req.body))

    const {
      type,
      title,
      session,
      challengeCriteria,
      activities,
      reviewType
    } = req.body.data.ChallengeMetric.node.challenge
    const { id, firstName, lastName } = req.body.data.ChallengeMetric.node.user

    if (reviewType === "Touchpoint") {
      if (type === "Submission") {
        // Trigger bot convo for asking questions

        debug("Challenge is a Submission")

        const bot = controller.spawn({})

        controller.studio
          .get(
            bot,
            `challenge_metric_${type.toLowerCase()}_start`,
            id,
            `Bot-${id}`
          )
          .then(convo => {
            convo.setVar("firstName", firstName)
            convo.setVar("lastName", lastName)
            convo.setVar("title", title)
            convo.setVar("type", type)
            convo.setVar("text", activities[0].text)
            convo.setVar("userId", id)

            // crucial! call convo.activate to set it in motion
            convo.activate()
          })

        // Trigger bot convo if this is only one of many challenges remaining to be completed
      } else {
        // Trigger bot convo for confirming submission

        debug("Challenge is not a submission")

        const bot = controller.spawn({})

        controller.studio
          .get(bot, "challenge_metric_received", id, `Bot-${id}`)
          .then(convo => {
            convo.setVar("firstName", firstName)
            convo.setVar("lastName", lastName)
            convo.setVar("title", title)
            convo.setVar("type", type)
            convo.setVar("userId", id)
            convo.setVar("sessionTitle", session.title)
            convo.setVar("sessionNumber", session.number)

            // crucial! call convo.activate to set it in motion
            convo.activate()
          })
      }
    } else if (type === "Submission") {
      // Trigger bot convo for asking questions

      debug("Challenge is a Submission")

      const bot = controller.spawn({})

      controller.studio
        .get(
          bot,
          `challenge_metric_${type.toLowerCase()}_incremental_start`,
          id,
          `Bot-${id}`
        )
        .then(convo => {
          convo.setVar("firstName", firstName)
          convo.setVar("lastName", lastName)
          convo.setVar("title", title)
          convo.setVar("type", type)
          convo.setVar("text", activities[0].text)
          convo.setVar("userId", id)

          // crucial! call convo.activate to set it in motion
          convo.activate()
        })

      // Trigger bot convo if this is only one of many challenges remaining to be completed
    } else {
      // Trigger bot convo for confirming submission

      debug("Challenge is not a submission")

      const bot = controller.spawn({})

      controller.studio
        .get(bot, "challenge_metric_incremental_received", id, `Bot-${id}`)
        .then(convo => {
          convo.setVar("firstName", firstName)
          convo.setVar("lastName", lastName)
          convo.setVar("title", title)
          convo.setVar("type", type)
          convo.setVar("userId", id)
          convo.setVar("sessionTitle", session.title)
          convo.setVar("sessionNumber", session.number)

          // crucial! call convo.activate to set it in motion
          convo.activate()
        })
    }

    res.status(200)
    res.end("OK")

    // Now, pass the webhook into be processed
    // controller.handleWebhookPayload(req, res);
  })
}
