const axios = require('axios');

const serialise = (transactions, accountId) => (
  {
    transactions: transactions.map(transaction => (
      {
        account_id: accountId,
        date: transaction.date,
        amount: transaction.amount,
        payee_name: transaction.payee,
        memo: transaction.memo,
        cleared: transaction.cleared,
        import_id: transaction.importId,
      }
    )),
  }
);

exports.load = async (transactions, config, logger) => {
  const { budgetId, accountId, accessToken } = config;
  const url = `https://api.youneedabudget.com/v1/budgets/${budgetId}/transactions`;
  const res = await axios({
    method: 'POST',
    url,
    data: serialise(transactions, accountId),
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const body = res.data;
  logger.info(`Uploaded ${body.data.transaction_ids.length} transactions; ${body.data.duplicate_import_ids.length} duplicate transactions ignored`);
};
