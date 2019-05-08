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
  let res;

  try {
    res = await axios({
      method: 'POST',
      url,
      data: serialise(transactions, accountId),
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(error.response.data);
      logger.error(error.response.status);
      logger.error(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      logger.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error(error.message);
    }
    logger.error(error.config);
    throw error;
  }

  const body = res.data;
  logger.info(`Uploaded ${body.data.transaction_ids.length} transactions; ${body.data.duplicate_import_ids.length} duplicate transactions ignored`);
};
