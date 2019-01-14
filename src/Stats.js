import * as R from 'ramda';

const LEVELS = {
  1: [4, 4, 15, 0],
  2: [5, 4, 22, 0],
  3: [7, 6, 24, 5],
  4: [7, 8, 31, 16],
  5: [12, 10, 35, 20],
  6: [16, 10, 38, 24],
  7: [18, 17, 40, 26],
  8: [22, 20, 46, 29],
  9: [30, 22, 50, 36],
  10: [35, 31, 54, 40],
  11: [40, 35, 62, 50],
  12: [48, 40, 63, 58],
  13: [52, 48, 70, 64],
  14: [60, 55, 78, 70],
  15: [68, 64, 86, 72],
  16: [72, 70, 92, 95],
  17: [72, 78, 100, 100],
  18: [85, 84, 115, 108],
  19: [87, 86, 130, 115],
  20: [92, 88, 138, 128],
  21: [95, 90, 149, 135],
  22: [97, 90, 158, 146],
  23: [99, 94, 165, 153],
  24: [103, 98, 170, 161],
  25: [113, 100, 174, 161],
  26: [117, 105, 180, 168],
  27: [125, 107, 189, 175],
  28: [130, 115, 195, 180],
  29: [135, 120, 200, 190],
  30: [140, 130, 210, 200],
};
const getSum = (total, num) => total + num;

/**
 * [changeStats description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function changeStats(model) {
  const {player} = model;
  const {nameSum, progression, level} = player;
  const baseLevelStats = LEVELS[level];
  const newStats = statsCalc(nameSum, progression, baseLevelStats);
  const [newStr, newAgi, newHP, newMP] = newStats;
  console.log('New Stats are...');
  console.log(newStats);
  return R.pipe(
      R.assoc('strength', newStr),
      R.assoc('agility', newAgi),
      R.assoc('hp', newHP),
      R.assoc('maxhp', newHP),
      R.assoc('mp', newMP))(player);
};

/**
 * [statsCalc Generates new stats based on name and level]
 * @param  {[integer]} nameSum        [Number dervived from name as a modifier]
 * @param  {[integer]} progression    [Number marking progression type]
 * @param  {[object]} baseLevelStats [Array of base statistics for the level]
 * @return {[object]}                [New player statstics set]
 */
function statsCalc(nameSum, progression, baseLevelStats) {
  if (progression === 0) {
    return prog0(nameSum, baseLevelStats);
  }
  if (progression === 1) {
    return prog1(nameSum, baseLevelStats);
  }
  if (progression === 2) {
    return prog2(nameSum, baseLevelStats);
  }
  if (progression === 3) {
    return prog3(nameSum, baseLevelStats);
  }
}

const statSlowProg = (nameSum, stat) => Math.floor((stat * (9/10)) +
(Math.floor(nameSum/4)) % 4);

function prog0(nameSum, baseLevelStats) {
  const [strength, agility, hp, mp] = baseLevelStats;
  const statBuild = R.pipe(R.append(statSlowProg(nameSum, strength)),
      R.append(statSlowProg(nameSum, agility)),
      R.append(hp),
      R.append(mp)
  );
  return statBuild([]);
}

// TODO
function prog1(nameSum, baseLevelStats) {
  const newStats = [];
  const [strength, agility, hp, mp] = baseLevelStats;
  newStats.push(strength);
  newStats.push(statSlowProg(nameSum, agility));
  newStats.push(hp);
  newStats.push(statSlowProg(nameSum, mp));
  return newStats;
}

// TODO
function prog2(nameSum, baseLevelStats) {
  const newStats = [];
  const [strength, agility, hp, mp] = baseLevelStats;
  newStats.push(statSlowProg(nameSum, strength)),
  newStats.push(agility);
  newStats.push(statSlowProg(nameSum, hp)),
  newStats.push(mp);
  return newStats;
}

// TODO
function prog3(nameSum, baseLevelStats) {
  const newStats = [];
  const [strength, agility, hp, mp] = baseLevelStats;
  newStats.push(strength);
  newStats.push(agility);
  newStats.push(statSlowProg(nameSum, hp)),
  newStats.push(statSlowProg(nameSum, mp));
  return newStats;
}

// TODO
// Such a stupid function, but necessary for simulation
/**
 * [changeName computes the necessary variables for
 *  stat computation based on name]
 * @param  {[message]} msg [Player's name]
 * @param  {[model]} model [Player's name]
 * @return {[object]}      [Name sum and progression type]
 */
export function changeName(msg, model) {
  const {name} = msg;
  const {player} = model;
  const letters = name.split('').slice(0, 4); // Get the first four letters of the name.
  // The columns of the name entry screen  in the original game
  // correspond to different numbers. I'm omitting the punctuation
  // and defaulting everything to 0 that isn't a lower or uppercase letter.
  const sum = letters.map((x) => {
    if (R.gt('gwM'.indexOf(x), -1)) return 0;
    if (R.gt('hxN'.indexOf(x), -1)) return 1;
    if (R.gt('iyO'.indexOf(x), -1)) return 2;
    if (R.gt('jzP'.indexOf(x), -1)) return 3;
    if (R.gt('kAQ'.indexOf(x), -1)) return 4;
    if (R.gt('lBR'.indexOf(x), -1)) return 5;
    if (R.gt('mCS'.indexOf(x), -1)) return 6;
    if (R.gt('nDT'.indexOf(x), -1)) return 7;
    if (R.gt('oEU'.indexOf(x), -1)) return 8;
    if (R.gt('pFV'.indexOf(x), -1)) return 9;
    if (R.gt('aqGW'.indexOf(x), -1)) return 10;
    if (R.gt('brHX'.indexOf(x), -1)) return 11;
    if (R.gt('csIY'.indexOf(x), -1)) return 12;
    if (R.gt('dtJZ'.indexOf(x), -1)) return 13;
    if (R.gt('euK'.indexOf(x), -1)) return 14;
    if (R.gt('fvL'.indexOf(x), -1)) return 15;
    return 0;
  }
  ).reduce(getSum);
  // Get the progression type, an integer from 0 to 3
  const type = Math.floor(sum % 4);
  return {...player, name: name, nameSum: sum, progression: type};
}
