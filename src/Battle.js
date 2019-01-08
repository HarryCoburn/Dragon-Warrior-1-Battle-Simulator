import {randomFromRange, isArr} from './Utils.js';
import * as R from 'ramda';

// Starting battle...
export const startBattle = (x) => R.pipe(checkClean, prepareEnemy)(x);

// Reset battleText
const checkClean = (x) => R.when(needToClean, cleanTextPipe)(x);
const needToClean = R.propEq('cleanBattleText', true);
const cleanTextPipe = (x) => R.pipe(clearText, clearTextCheck)(x);
const clearText = R.assoc('battleText', []);
const clearTextCheck = R.assoc('cleanBattleText', false);

// Prepare selected enemy or warn that it hasn't been selected
const prepareEnemy = (x) =>
  R.ifElse(checkEnemyObject, fightSetup, chooseWarning)(x);

// Confirm that 'enemy' in the model object contains an enemy object.
const checkEnemyObject = R.propIs(Object, 'enemy');

/**
 * [fightSetup Set up hit points for both player and enemy, checks initiative, then returns to Update]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function fightSetup(model) {
  const {enemy, player} = model;
  const {hp} = enemy;
  const enemyHP = calculateEnemyHP(hp);
  const finalModel = {...model,
    player: R.assoc('hp', player.maxhp)(player),
    enemy: R.pipe(R.assoc('hp', enemyHP), R.assoc('maxhp', enemyHP))(enemy),
    inBattle: true,
    battleText: R.append(`You are fighting the ${model.enemy.name}`, model.battleText)};
  console.log(finalModel);
  return {...finalModel, initiative: checkInit(finalModel)};
}

// Checks if  enemy object has an array for HP.
// If so, get a random number in that range.
// Otherwise, just return the number given.
const calculateEnemyHP = (x) => {
  return R.when(isArr, randomFromRange)(x);
};

/**
 * [chooseWarning
 * Tell user they need to select an enemy and prepare model for that.]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function chooseWarning(model) {
  return {...model, battleText: R.append(`Please choose an enemy!`, model.battleText), cleanBattleText: true, initiative: false};
}

// Generate initiative number. x = agility, y = modifier
const initiative = (x, y = 1) => x * randomFromRange([0, 255]) * y;

/**
 * [checkInit Does an initiative check]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function checkInit(model) {
  const {player, enemy} = model;
  return initiative(player.agility) > initiative(enemy.agility, 0.25);
}
