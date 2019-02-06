const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');

const { logger } = require('./logger');
const { SabadellTransaction } = require('../extractor');
const transformer = require('../transformer');

describe('transformer', () => {
  describe('transform', () => {
    beforeEach(() => transformer.resetOccurrenceCounter());

    it('includes a cleared field', () => {
      const input = [
        new SabadellTransaction('13/12/2018', '', '0', ''),
      ];
      const result = transformer.transform(input, logger);
      expect(result[0].cleared).to.eq('cleared');
    });

    it('transforms the date formatting', () => {
      const input = [
        new SabadellTransaction('13/12/2018', '', '0', ''),
      ];
      const result = transformer.transform(input, logger);
      expect(result[0].date).to.eq('2018-12-13');
    });

    it('casts and scales the amount', () => {
      const input = [
        new SabadellTransaction('', '', '-14.99', ''),
        new SabadellTransaction('', '', '69.17', ''),
        new SabadellTransaction('', '', '0', ''),
      ];

      const result = transformer.transform(input, logger);
      expect(result[0].amount).to.eq(-14990);
      expect(result[1].amount).to.eq(69170);
      expect(result[2].amount).to.eq(0);
    });

    it('infers transactions by Jim and Odette', () => {
      const input = [
        new SabadellTransaction('', '', '', '1234123412348020'),
        new SabadellTransaction('', '', '', '1234123412342037'),
        new SabadellTransaction('', '', '', ''),
      ];

      const result = transformer.transform(input, logger);
      expect(result[0].memo).to.eq('Jim');
      expect(result[1].memo).to.eq('Odette');
      expect(result[2].memo).to.eq('');
    });

    it('cleans the payee to remove useless boilerplate', () => {
      const input = [
        new SabadellTransaction('', 'PURCHASE WITH CARD 1234XXXXXXXX8020 GOOGLE Google Music-London', '', ''),
        new SabadellTransaction('', 'PURCHASE WITH CARD 1234XXXXXXXX2037 AMZN Mktp ES-800-279-6620', '', ''),
      ];

      const result = transformer.transform(input, logger);
      expect(result[0].payee).to.eq('GOOGLE Google Music-London');
      expect(result[1].payee).to.eq('AMZN Mktp ES-800-279-6620');
    });

    it('creates import_id fields for the transactions', () => {
      const input = [
        new SabadellTransaction('01/01/2019', '', '1', ''),
        new SabadellTransaction('01/01/2019', '', '1', ''),
        new SabadellTransaction('02/01/2019', '', '1', ''),
        new SabadellTransaction('02/01/2019', '', '2', ''),
      ];

      const result = transformer.transform(input, logger);
      expect(result[0].importId).to.eq('YNAB:1000:2019-01-01:1');
      expect(result[1].importId).to.eq('YNAB:1000:2019-01-01:2');
      expect(result[2].importId).to.eq('YNAB:1000:2019-01-02:1');
      expect(result[3].importId).to.eq('YNAB:2000:2019-01-02:1');
    });
  });
});
