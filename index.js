const winston = require('winston');
require('dotenv').config();

const extractor = require('./extractor');
const transformer = require('./transformer');
const loader = require('./loader');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

const getConfig = () => {
  const requiredEnv = [
    'SABADELL_USER_ID',
    'SABADELL_PIN',
    'YNAB_ACCESS_TOKEN',
    'YNAB_ACCOUNT_ID',
    'YNAB_BUDGET_ID',
  ];

  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Required configuration ${key} is missing`);
    }
  });

  return {
    sabadell: {
      userId: process.env.SABADELL_USER_ID,
      pin: process.env.SABADELL_PIN,
    },
    ynab: {
      accessToken: process.env.YNAB_ACCESS_TOKEN,
      accountId: process.env.YNAB_ACCOUNT_ID,
      budgetId: process.env.YNAB_BUDGET_ID,
    },
  };
};

async function main() {
  const config = getConfig();
  // const sabadellTransactions = await extractor.transactionsFromSite(config.sabadell, logger);
  const sabadellTransactions = await extractor.transactionsFromFile('transactions.txt', logger);
  const ynabTransactions = transformer.transform(sabadellTransactions, logger);
  await loader.load(ynabTransactions, config.ynab, logger);
  logger.info('Done');
}
main();
