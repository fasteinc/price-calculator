const { computeDisplays, compute } = require('./');
const { expect } = require('chai');

const quote = {
  deposit: 10,
  tva: 22,
  price: 120,
  margin: 15,
  reduction: 15,
};

const currency = {
  symbol: '$',
};

const globalLines = [
  {
    name: 'HT',
    key: 'ht',
    computeValue: 'quote.price',
    computeDisplay: 'quote.price',
    hidden: true,
  },
  {
    name: 'margin',
    key: 'margin',
    payload: {},
    computeValue: '(quote.margin / 100 + 1) * value',
    computeDisplay: '(quote.margin / 100) * value',
    hidden: true,
  },
  {
    name: 'fakeHT',
    key: 'fakeht',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: 'HT                 {{displayValue}} {{ currency.symbol }}',
  },
  {
    name: 'promo',
    key: 'promo',
    payload: {
      value: '25',
    },
    computeValue: 'value - line.payload.value',
    computeDisplay: 'line.payload.value',
    displayTemplate: 'reduction                 - {{displayValue}} {{ currency.symbol }}',
  },
  {
    name: 'VAT',
    key: 'vat',
    payload: {
      value: '20',
    },
    computeValue: 'value * (line.payload.value / 100 + 1)',
    computeDisplay: 'line.payload.value / 100 * value',
    displayTemplate: '{{line.name}} {{line.payload.value}}%               {{displayValue}} {{ currency.symbol }}',
  },
  {
    name: 'VAT',
    key: 'vat',
    payload: {
      value: '20',
    },
    computeValue: 'value * (line.payload.value / 100 + 1)',
    computeDisplay: 'line.payload.value / 100 * value',
    displayTemplate: '{{line.name}} {{line.payload.value}}%               {{displayValue}} {{ currency.symbol }}',
  },
  {
    name: 'total',
    key: 'total',
    computeValue: 'value',
    displayTemplate: '{{line.name}}               {{displayValue}} {{ currency.symbol }}',
  },
  {
    name: 'deposit',
    key: 'deposit',
    payload: {
      value: '10',
    },
    computeValue: 'value',
    computeDisplay: 'line.payload.value / 100 * value',
    displayTemplate: '{{line.name}} {{line.payload.value}}%               {{displayValue}} {{ currency.symbol }}',
  },
];

const basicQuoteValues = {
  ht: { displayValue: 120, value: 120 },
  margin: { displayValue: 20.7, value: 138 },
  fakeht: { displayValue: 138, value: 138 },
  promo: { displayValue: '25', value: 113 },
  vat: { displayValue: 32.544000000000004, value: 162.72 },
  total: { displayValue: 162.72, value: 162.72 },
  deposit: { displayValue: 16.272000000000002, value: 162.72 },
};

const basicQuoteDisplay = {
  deposit: 'deposit 10%               16.272000000000002 $',
  fakeht: 'HT                 138 $',
  promo: 'reduction                 - 25 $',
  total: 'total               162.72 $',
  vat: 'VAT 20%               32.544000000000004 $',
};

describe(' basic quote test', function () {
  it('compute values', function () {
    const res = compute(globalLines, { context: { quote } });

    expect(res).to.deep.equal(basicQuoteValues);
  });
  it('compute display', function () {
    const displayRes = computeDisplays(globalLines, { context: { quote, currency }, contexts: basicQuoteValues });

    expect(displayRes).to.deep.equal(basicQuoteDisplay);
  });

});
