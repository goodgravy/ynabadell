const download = require('./download');
const parse = require('./parse');

exports.SabadellTransaction = parse.SabadellTransaction;

exports.transactions = async (config, logger) => {
  const { userId, pin } = config;
  const file = await download.records(userId, pin, logger);
  return parse.transactions(file, logger);
};
