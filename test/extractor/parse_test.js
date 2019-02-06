const path = require('path');
const { describe, it } = require('mocha');
const { expect } = require('chai');

const { logger } = require('../logger');
const { transactions } = require('../../extractor/parse');

describe('extractor', () => {
  describe('parse.transactions', () => {
    it('returns as many transactions as there are non-blank lines', (done) => {
      const fixture = path.resolve(__dirname, 'simple_download.csv');
      expect(transactions(fixture, logger).length).to.equal(5);
      done();
    });

    it('parses out all the fields', () => {
      const fixture = path.resolve(__dirname, 'all_fields.csv');
      const result = transactions(fixture, logger);

      expect(result[0].date).to.eq('15/02/2019');
      expect(result[1].date).to.eq('15/01/2019');
      expect(result[2].date).to.eq('14/12/2018');

      expect(result[0].payee).to.eq('PURCHASE WITH CARD 1234XXXXXXXX8020 GOOGLE Google Music-London');
      expect(result[1].payee).to.eq('PURCHASE WITH CARD 1234XXXXXXXX2037 AMZN Mktp ES-800-279-6620');
      expect(result[2].payee).to.eq('some payee');

      expect(result[0].amount).to.eq('-14.99');
      expect(result[1].amount).to.eq('69.17');
      expect(result[2].amount).to.eq('0');

      expect(result[0].cardNumber).to.eq('1234123412348020');
      expect(result[1].cardNumber).to.eq('1234123412342037');
      expect(result[2].cardNumber).to.eq('');
    });
  });
});
