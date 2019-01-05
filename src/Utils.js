export const coinFlip = // Returns true/false like tossing a coin
  () => Math.floor(Math.random() * 2) === 0;

export const capitalize = // Capitalizes first character in string
  (x) => x.charAt(0).toUpperCase() + x.slice(1);

export const randomFromRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
