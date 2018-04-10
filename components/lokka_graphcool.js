// Lokka client for Graphcool hookup
let Lokka = require("lokka").Lokka
let Transport = require("lokka-transport-http").Transport

console.log("Preparing lokka client with env: ", process.env.NODE_ENV)

let GQL_AUTH_TOKEN =
  process.env.NODE_ENV === "dev"
    ? process.env.GQL_AUTH_TOKEN_DEV
    : process.env.NODE_ENV === "staging"
      ? process.env.GQL_AUTH_TOKEN_DEV
      : process.env.GQL_AUTH_TOKEN

let GQL_SIMPLE_API =
  process.env.NODE_ENV === "dev"
    ? process.env.GQL_SIMPLE_API_DEV
    : process.env.NODE_ENV === "staging"
      ? process.env.GQL_SIMPLE_API_DEV
      : process.env.GQL_SIMPLE_API

const headers = {
  Authorization: `Bearer ${GQL_AUTH_TOKEN}`
}

const lokkaClient = new Lokka({
  transport: new Transport(GQL_SIMPLE_API, { headers })
})

module.exports = lokkaClient
