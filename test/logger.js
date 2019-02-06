const winston = require('winston');
const { NullTransport } = require('winston-null');

exports.logger = winston.createLogger({
  transports: [new NullTransport()],
});
