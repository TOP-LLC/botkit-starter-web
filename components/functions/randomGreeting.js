module.exports = function(allEvents, event, user) {

let greetings = [
    'Good morning',
    'Rise and shine',
    `What's up`,
    `Hey`,
    `Boom`,
    `Buenos dias`,
    `Yo`,
    `Listen up`,
    `Hello there`,
    `Let's get going`
];

let randomNumber = Math.floor(Math.random()*greetings.length);

let greeting = greetings[randomNumber];

return greeting

}