const { expect } = require('chai');
const { describe, it, afterEach } = require('mocha');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const { logger } = require('./logger');
const loader = require('../loader');
const { YNABTransaction } = require('../transformer');

describe('loader', () => {
  describe('load', () => {
    const mock = new MockAdapter(axios);
    const emptyResponse = {
      data: { transaction_ids: [], duplicate_import_ids: [] },
    };
    const twoTransactions = [
      new YNABTransaction('2019-01-01', 'payee 1', 'memo 1', 1000),
      new YNABTransaction('2019-01-02', 'payee 2', 'memo 2', 2000),
    ];

    afterEach(() => mock.reset());

    it('uses the accessToken in the Authorization header', async () => {
      const accessToken = 'test-token';
      mock.onPost(/\/transactions$/).reply((config) => {
        expect(config.headers.Authorization).to.equal('Bearer test-token');
        return [201, emptyResponse];
      });

      await loader.load([], { accessToken }, logger);
    });

    it('POSTs to a URL including the budget ID', async () => {
      mock
        .onPost(new RegExp('/v1/budgets/my-budget-id/transactions$'))
        .reply(() => [201, emptyResponse]);

      await loader.load([], { budgetId: 'my-budget-id' }, logger);
    });

    it('POSTs all the transaction in the request body', async () => {
      mock.onPost(/\/transactions$/).reply((config) => {
        const { transactions } = JSON.parse(config.data);

        expect(transactions[0]).to.have.deep.property('date', '2019-01-01');
        expect(transactions[0]).to.have.deep.property('amount', 1000);
        expect(transactions[0]).to.have.deep.property('payee_name', 'payee 1');
        expect(transactions[0]).to.have.deep.property('memo', 'memo 1');

        expect(transactions[1]).to.have.deep.property('date', '2019-01-02');
        expect(transactions[1]).to.have.deep.property('amount', 2000);
        expect(transactions[1]).to.have.deep.property('payee_name', 'payee 2');
        expect(transactions[1]).to.have.deep.property('memo', 'memo 2');

        return [201, emptyResponse];
      });

      await loader.load(twoTransactions, { budgetId: 'my-budget-id' }, logger);
    });
  });
});
