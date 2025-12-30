import currency from 'currency.js';

const calculate = {
  add: (firstValue, secondValue) => {
    return currency(firstValue).add(secondValue).value;
  },
  sub: (firstValue, secondValue) => {
    return currency(firstValue).subtract(secondValue).value;
  },
  multiply: (firstValue, secondValue) => {
    return currency(firstValue).multiply(secondValue).value;
  },
  divide: (firstValue, secondValue) => {
    return currency(firstValue).divide(secondValue).value;
  },
  // Round UP to 2 decimals
  roundUp2: (value) => {
    const n = Number(value) || 0;
    return Math.ceil(n * 100) / 100;
  },
  // Round (normal) to 2 decimals
  round2: (value) => {
    return currency(value, { precision: 2 }).value;
  },
};

export default calculate;
