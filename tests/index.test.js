const { diff } = require('deep-object-diff');
const { computeDisplays, compute } = require('../');
const { expect } = require('chai');


const currency = {
  symbol: '$',
};

const offerLines  =[
  {
    name: 'HT',
    computeValue: 'offer.price',
    computeDisplay: 'offer.price',
  },
  {
    name: 'margin',
    action: { payload: { value: 5 } },
    computeDisplay: 'offer.margin / 100 * value',
    computeValue: '(offer.margin / 100 + 1) * value',
  },
  {
    name: 'newht',
    visible: true,
    endpoint: '/global/shared_config/payment/default/newht',
    computeDisplay: 'value',
    computeValue: 'value',
    displayTemplate: 'HT',
  },
];

const quote = {
  deposit: 10,
  vat: 22,
  price: 120,
  margin: 15,
  reduction: 15,
  offers: [
    {
      name: 'Six Bedrooms - 7 to 11 June ',
      description: '',
      visible: true,
      price: 10600,
      deposit: 0,
      commission: 0,
      currency: {
        iso: 'EUR',
        isoNum: '978',
        name: 'Euro',
        symbol: '€',
        subUnit: 'cent',
        id: '5a5a4cb9b3079f003baccdfd',
      },
      options: [
        {
          name: 'Six Bedroom - FASTE Residence ',
          included: true,
        },
        {
          name: 'Driver',
          price: 50,
          included: false,
        },
      ],
    },
  ],
};

const offerComputedValues = [
  { name: 'HT',
    computeValue: 'offer.price',
    computeDisplay: 'offer.price',
    displayValue: 10600,
    value: 10600,
  },
  {
    name: 'newht',
    visible: true,
    endpoint: '/global/shared_config/payment/default/newht',
    computeDisplay: 'value',
    computeValue: 'value',
    displayTemplate: 'HT',
    displayValue: 10600,
    value: 10600,
  },
];
offerComputedValues._totalPrice = 10600;

const offerDisplayValues = [
  {
    name: 'newht',
    visible: true,
    endpoint: '/global/shared_config/payment/default/newht',
    computeDisplay: 'value',
    computeValue: 'value',
    displayTemplate: 'HT',
    displayValue: 10600,
    value: 10600,
    displayTitle: 'HT',
  },
];

describe(' basic offer test', function () {
  it('compute values', function () {
    const res = compute(offerLines, { context: { offer: quote.offers[0] }, beforeSave: value => Number(Number(value).toFixed(5)) });
    expect(diff(offerComputedValues, res)).to.be.deep.equal({});
  });
  it('compute display', function () {
    const displayRes = computeDisplays(offerComputedValues, { context: { offer: quote.offers[0], currency } });
    expect(diff(offerDisplayValues, displayRes)).to.be.deep.equal({});

  });

});

const quoteLines = [
  {
    name: 'HT',
    computeValue: 'value',
  },
  {
    name: 'margin',
    payload: {},
    computeValue: '(quote.margin / 100 + 1) * value',
    computeDisplay: '(quote.margin / 100) * value',
  },
  {
    name: 'fakeHT',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: 'HT',
    visible: true,
  },
  {
    name: 'promo',
    payload: {
      value: 25,
    },
    computeValue: 'value - line.payload.value',
    computeDisplay: 'line.payload.value',
    displayTemplate: 'reduction',
    visible: true,
  },
  {
    name: 'VAT',
    computeValue: 'value * (quote.vat / 100 + 1)',
    computeDisplay: 'quote.vat / 100 * value',
    displayTemplate: '{{line.name}} {{quote.vat}}%',
    visible: true,
  },
  {
    name: 'total',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: '{{line.name}}',
    visible: true,
  },
  {
    name: 'deposit',
    payload: {
      value:10,
    },
    computeValue: 'value',
    computeDisplay: 'line.payload.value / 100 * value',
    displayTemplate: '{{line.name}} {{line.payload.value}}%',
    visible: true,
  },
];

const quoteComputedValues =  [
  {
    name: 'HT',
    computeValue: 'value',
    value: 120,
    displayValue: null,
  },
  {
    name: 'margin',
    payload: {},
    computeValue: '(quote.margin / 100 + 1) * value',
    computeDisplay: '(quote.margin / 100) * value',
    displayValue:18,
    value: 138,
  },
  {
    name: 'fakeHT',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: 'HT',
    displayValue: 138,
    value: 138,
    visible: true,
  },
  {
    name: 'promo',
    payload: {
      value: 25,
    },
    computeValue: 'value - line.payload.value',
    computeDisplay: 'line.payload.value',
    displayTemplate: 'reduction',
    displayValue: 25,
    value: 113,
    visible: true,
  },
  {
    name: 'VAT',
    computeValue: 'value * (quote.vat / 100 + 1)',
    computeDisplay: 'quote.vat / 100 * value',
    displayTemplate: '{{line.name}} {{quote.vat}}%',
    displayValue: 24.86,
    value: 137.86,
    visible: true,
  },
  {
    name: 'total',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: '{{line.name}}',
    displayValue: 137.86,
    value: 137.86,
    visible: true,
  },
  {
    name: 'deposit',
    payload: {
      value: 10,
    },
    computeValue: 'value',
    computeDisplay: 'line.payload.value / 100 * value',
    displayTemplate: '{{line.name}} {{line.payload.value}}%',
    displayValue: 13.78600,
    value: 137.86,
    visible: true,
  },
];
quoteComputedValues._totalPrice = 137.86;

const quoteDisplayValues =  [
  {
    name: 'fakeHT',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: 'HT',
    value: 138,
    displayTitle: 'HT',
    displayValue: 138,
    visible: true,
  },
  {
    name: 'promo',
    payload: {
      value: 25,
    },
    computeValue: 'value - line.payload.value',
    computeDisplay: 'line.payload.value',
    displayTemplate: 'reduction',
    displayValue: 25,
    value: 113,
    displayTitle: 'reduction',
    visible: true,
  },
  {
    name: 'VAT',
    computeValue: 'value * (quote.vat / 100 + 1)',
    computeDisplay: 'quote.vat / 100 * value',
    displayTemplate: '{{line.name}} {{quote.vat}}%',
    displayValue: 24.86,
    value: 137.86,
    displayTitle: 'VAT 22%',
    visible: true,
  },
  {
    name: 'total',
    computeValue: 'value',
    computeDisplay: 'value',
    displayTemplate: '{{line.name}}',
    displayValue: 137.86,
    value: 137.86,
    displayTitle: 'total',
    visible: true,
  },
  {
    name: 'deposit',
    payload: {
      value: 10,
    },
    computeValue: 'value',
    computeDisplay: 'line.payload.value / 100 * value',
    displayTemplate: '{{line.name}} {{line.payload.value}}%',
    displayValue: 13.786,
    value: 137.86,
    displayTitle: 'deposit 10%',
    visible: true,
  },
];

describe(' basic quote test', function () {
  it('compute values', function () {
    const res = compute(quoteLines, { context: { quote, value: quote.price }, beforeSave: value => Number(Number(value).toFixed(5)) });
    expect(diff(quoteComputedValues, res)).to.be.deep.equal({});
  });
  it('compute display', function () {
    const displayRes = computeDisplays(quoteComputedValues, { context: { quote } });
    expect(diff(quoteDisplayValues, displayRes)).to.be.deep.equal({});
  });

});
