// Lokka client for Graphcool hookup
const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;

console.log('Preparing lokka client with env: ', process.env.NODE_ENV);

const GQL_AUTH_TOKEN = process.env.GQL_AUTH_TOKEN_DEV;

const GQL_SIMPLE_API = process.env.GQL_SIMPLE_API_DEV;

const headers = {
  Authorization: `Bearer ${GQL_AUTH_TOKEN}`,
};

const lokkaClient = new Lokka({
  transport: new Transport(GQL_SIMPLE_API, { headers }),
});

module.exports = lokkaClient;
