const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');
const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const responseService = require('./core/ResponseService');
const log = require('./core/Log');
const config = require('./config/app');
const db = require('./core/db');
const server = express();

server.use(helmet());
server.use(cors());
server.use(responseService.checkHeaders('content-type', config.requiredHeaders['content-type'], ['POST']));
server.use(json());
server.use(responseService.checkInvalidJSON);

server.get('/server/list/', (request, response) => {
  const payload = new Payload();

  payload.add('status', 'success');
  payload.add('data', db.server.list);
  response.send(payload.get());
});

server.post('/server/add/', (request, response) => {
  const payload = new Payload();
  const server = {
    host: request.socket.remoteAddress,
    port: request.body.port,
    name: request.body.name,
    playersOnline: 0,
    playersMax: request.body.playersMax
  }
  const requiredFields = new RequiredFields(RequiredFields.server.add, {
    port: server.port,
    name: server.name,
    playersMax: server.playersMax
  });

  if (!requiredFields.state) {
    payload.add('status', 'error');
    payload.add('message', requiredFields.message);
    response.send(payload.get());

    return;
  }

  if (db.server.getByHost(server.host)) {
    payload.add('status', 'error');
    payload.add('message', `Server ${server.host} already exists on master server`);
    response.send(payload.get());

    return;
  }

  db.server.list.push(server);
  payload.add('status', 'success');
  payload.add('data', server);
  response.send(payload.get());
});

server.listen(config.port, 'localhost', () => {
  log.info(`Master server listening on localhost:${config.port}`);
});

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use localhost:${config.port}`);
  } else {
    log.normal(error);
  }

  process.exit();
});