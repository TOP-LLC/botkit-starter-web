const getUserData = require('./../components/graphcool/queries/get_user_touchpoint_status');
const debug = require('debug')('botkit:client_onboarding_studio');
const dateFormat = require('dateformat')

module.exports = (controller) => {
    
    // define a before hook
    // you may define multiple before hooks. they will run in the order they are defined.
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudiobefore
    controller.studio.before('Whats-Next', async (convo, next) => {

        // Get user progressCurrent and touchpointStatus
        const userData = await getUserData(convo.context.user)
        console.log("User data returned is ", userData)
        const {touchpointStatus, progressCurrent} = userData

        convo.setVar("firstName", userData.firstName)
        convo.setVar("cycleTitle", progressCurrent.cycle.title)
        convo.setVar("cycleNumber", progressCurrent.cycle.number)
        convo.setVar("sessionTitle", progressCurrent.session.title)
        convo.setVar("sessionNumber", progressCurrent.session.number)
        convo.setVar("sprintTitle", progressCurrent.sprint.title)
        convo.setVar("sprintNumber", progressCurrent.sprint.number)
        convo.setVar("challengeTitle", progressCurrent.challenges[0].title)
        convo.setVar("touchpointDate", dateFormat(touchpointStatus.touchpointAppointment.date, "fullDate"))
        convo.setVar("trainer", userData.trainer.firstName)
        convo.setVar("touchpointStatus", touchpointStatus.status)
        console.log("Touchpoint status is ", touchpointStatus)

        // do some preparation before the conversation starts...
        // for example, set variables to be used in the message templates
        // convo.setVar('foo','bar');

        console.log('BEFORE: Whats-Next');
        // don't forget to call next, or your conversation will never continue.
        next();

    });

    /* Validators */
    // Fire a function whenever a variable is set because of user input
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudiovalidate
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Validate user input: verify_intent
    controller.studio.validate('Whats-Next','verify_intent', function(convo, next) {

        var value = convo.extractResponse('verify_intent');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: Whats-Next VARIABLE: verify_intent');

        // always call next!
        next();

    });

    // Validate user input: question_1
    controller.studio.validate('Whats-Next','question_1', function(convo, next) {

        var value = convo.extractResponse('question_1');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: Whats-Next VARIABLE: question_1');

        // always call next!
        next();

    });

    // Validate user input: question_2
    controller.studio.validate('Whats-Next','question_2', function(convo, next) {

        var value = convo.extractResponse('question_2');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: Whats-Next VARIABLE: question_2');

        // always call next!
        next();

    });

    // Validate user input: question_3
    controller.studio.validate('Whats-Next','question_3', function(convo, next) {

        var value = convo.extractResponse('question_3');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: Whats-Next VARIABLE: question_3');

        // always call next!
        next();

    });

    /* Thread Hooks */
    // Hook functions in-between threads with beforeThread
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudiobeforethread
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Before the default thread starts, run this:
    controller.studio.beforeThread('Whats-Next','default', async (convo, next) => {

        console.log('In the script *Whats-Next*, about to start the thread *default*');

        // always call next!
        next();
    });

    // Before the wrong_intent thread starts, run this:
    controller.studio.beforeThread('Whats-Next','wrong_intent', function(convo, next) {

        /// do something fun and useful
        // convo.setVar('name','value');

        console.log('In the script *Whats-Next*, about to start the thread *wrong_intent*');

        // always call next!
        next();
    });

    // Before the whats_next thread starts, run this:
    controller.studio.beforeThread('Whats-Next','whats_next', async (convo, next) => {

        return convo.gotoThread(convo.vars.touchpointStatus);
    });


    // define an after hook
    // you may define multiple after hooks. they will run in the order they are defined.
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudioafter
    controller.studio.after('Whats-Next', function(convo, next) {

        console.log('AFTER: Whats-Next');

        // handle the outcome of the convo
        if (convo.successful()) {

            var responses = convo.extractResponses();
            // do something with the responses

        }

        // don't forget to call next, or your conversation will never properly complete.
        next();
    });
}
