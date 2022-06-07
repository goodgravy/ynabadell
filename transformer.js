const moment = require('moment');

const transform = require('stream-transform/lib/sync');

// To generate the import_id fields, we need an occurrence counter which increments for transactions
// of the same amount on the same day. This allows us to generate those occurrence indices.
const newOccurrenceProxy = () => (
  new Proxy({}, {
    get: (target, amountAndDate) => (amountAndDate in target ? target[amountAndDate] : 0),
  })
);
let transactionCounterByAmountAndDate;

const generateImportId = (amount, date) => {
  transactionCounterByAmountAndDate[amount + date] += 1;
  const occurrence = transactionCounterByAmountAndDate[amount + date];
  return `YNAB:${amount}:${date}:${occurrence}`;
};

const transformDate = date => (
  moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
);

const transformPayee = (payee) => {
  const cardPurchaseRE = /^PURCHASE WITH CARD ([\dX]+) */;

  return payee.replace(cardPurchaseRE, '').substring(0, 50);
};

const inferMemo = (cardNumber) => {
  switch (cardNumber.slice(-4)) {
    case '2052':
      return 'Odette';
    case '8020':
      return 'Jim';
    default:
      return '';
  }
};

const transformAmount = amount => (
  Math.round(Number.parseFloat(amount) * 1000)
);

const sabadellToYnab = transaction => (
  new exports.YNABTransaction(
    transformDate(transaction.date),
    transformPayee(transaction.payee),
    inferMemo(transaction.cardNumber),
    transformAmount(transaction.amount),
  )
);

exports.resetOccurrenceCounter = () => {
  transactionCounterByAmountAndDate = newOccurrenceProxy();
};
exports.resetOccurrenceCounter();

exports.YNABTransaction = function YNABTransaction(date, payee, memo, amount) {
  return {
    date,
    payee,
    memo,
    amount,
    cleared: 'cleared',
    importId: generateImportId(amount, date),
  };
};

exports.transform = (sabadellTransactions, logger) => {
  const ynabTransactions = transform(sabadellTransactions, sabadellToYnab);

  logger.info(`Transformed into ${ynabTransactions.length} YNAB transactions`);

  return ynabTransactions;
};
