const express = require('express');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const debug = require('debug')('botkit:webserver');
const http = require('http');
const fs = require('fs');
const hbs = require('express-hbs');

module.exports = (controller) => {
  const webserver = express();
  webserver.use(bodyParser.json());

  // set up handlebars ready for tabs
  webserver.engine('hbs', hbs.express4({ partialsDir: `${__dirname}/../views/partials` }));
  webserver.set('view engine', 'hbs');
  webserver.set('views', `${__dirname}/../views/`);

  // import express middlewares that are present in /components/express_middleware
  const normalizedPathToMiddleware = require('path').join(__dirname, 'express_middleware');
  if (fs.existsSync(normalizedPathToMiddleware)) {
    fs.readdirSync(normalizedPathToMiddleware).forEach((file) => {
      require(`./express_middleware/${file}`)(webserver, controller);
    });
  }

  webserver.use(express.static('public'));

  const server = http.createServer(webserver);

  server.listen(process.env.PORT || 3000, null, () => {
    debug(`Express webserver configured and listening at http://localhost:${process.env.PORT}` || 3000);
  });

  // TODO: Does this call to identify really belong here?
  if (controller.config.studio_token) {
    controller.studio
      .identify()
      .then((identity) => {
        debug('Botkit Studio Identity:', identity.name);
        controller.studio_identity = identity;
        webserver.locals.bot = identity;
      })
      .catch((err) => {
        console.log('Error validating Botkit Studio API key!');
        throw new Error(err);
      });
  }

  // import all the pre-defined routes that are present in /components/routes
  const normalizedPathToRoutes = require('path').join(__dirname, 'routes');
  if (fs.existsSync(normalizedPathToRoutes)) {
    fs.readdirSync(normalizedPathToRoutes).forEach((file) => {
      require(`./routes/${file}`)(webserver, controller);
    });
  }

  controller.webserver = webserver;
  controller.httpserver = server;

  return webserver;
};
