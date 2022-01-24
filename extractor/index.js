const download = require('./download');
const parse = require('./parse');

exports.SabadellTransaction = parse.SabadellTransaction;

exports.transactionsFromSite = async (config, logger) => {
  const { userId, pin } = config;
  const file = await download.records(userId, pin, logger);
  return parse.transactions(file, logger);
};

exports.transactionsFromFile = async (file, logger) => {
  return parse.transactions(file, logger);
};
