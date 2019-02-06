const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const transform = require('stream-transform/lib/sync');

const recordToTransaction = record => (
  new exports.SabadellTransaction(record[0], record[1], record[3], record[6])
);

exports.SabadellTransaction = function SabadellTransaction(date, payee, amount, cardNumber) {
  return {
    date, payee, amount, cardNumber,
  };
};

exports.transactions = (inputFile, logger) => {
  logger.info(`Parsing ${inputFile}`);

  const input = fs.readFileSync(inputFile);
  const records = parse(input, {
    delimiter: '|',
    skip_empty_lines: true,
  });
  const transactions = transform(records, recordToTransaction);

  logger.info(`Parsed ${transactions.length} transactions`);

  return transactions;
};
