import * as R from 'ramda';

export const coinFlip = // Returns true/false like tossing a coin
  () => Math.floor(Math.random() * 2) === 0;

export const capitalize = // Capitalizes first character in string
  (x) => x.charAt(0).toUpperCase() + x.slice(1);

// Array check
export function isArr(x) {
  return R.is(Array, x);
};

export const randomFromRange = (arr) => {
  const [min, max] = arr;
  return Math.floor(Math.random() * (max - min + 1) + min);
};
