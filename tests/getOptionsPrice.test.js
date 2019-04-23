const { diff } = require('deep-object-diff');
const { getOptionsPrice } = require('../');
const { expect } = require('chai');

const empty = [];

const optionOnly = [{ price: 1, selected:1 }];

const optionMultiple = [{ price: 2, selected:5 }];

const includedOnly = [{ price: 1, selected:1, included: true }];

const includedAndOptions = [...optionOnly, ...includedOnly];

const options = [...optionOnly, ...optionOnly];

describe('basic tests', function () {
  it('empty values', function () {
    const res = getOptionsPrice(empty);
    expect(res).to.be.equal(0);
  });
  it('1 option', function () {
    const res = getOptionsPrice(optionOnly);
    expect(res).to.be.equal(1);
  });
  it('1 included', function () {
    const res = getOptionsPrice(includedOnly);
    expect(res).to.be.equal(0);
  });
  it('1 included 1 option', function () {
    const res = getOptionsPrice(includedAndOptions);
    expect(res).to.be.equal(1);
  });
  it('options', function () {
    const res = getOptionsPrice(options);
    expect(res).to.be.equal(2);
  });
  it('option multiple', function () {
    const res = getOptionsPrice(optionMultiple);
    expect(res).to.be.equal(10);
  });


});
