const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');
const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const responseService = require('./core/ResponseService');
const log = require('./core/Log');
const config = require('./config/app');
const server = express();

server.use(helmet());
server.use(cors());
server.use(responseService.checkHeaders('content-type', ['POST']));
server.use(json());
server.use(responseService.checkInvalidJSON);

server.get('/server-list/', (request, response) => {
  const payload = new Payload();
  const serverList = [
    {
      host: "localhost",
      port: 7777,
      name: 'Pixel survival official server',
      players: {
        online: 0,
        max: 32
      }
    }
  ]

  payload.add('status', 'success');
  payload.add('data', serverList);

  response.send(payload.get());
});

server.listen(config.port, config.host, () => {
  log.info(`Login server listening on ${config.host}:${config.port}`);
});

process.on('uncaughtException', error => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Error: address already in use ${config.host}:${config.port}`);
  } else {
    log.normal(error);
  }

  process.exit();
});