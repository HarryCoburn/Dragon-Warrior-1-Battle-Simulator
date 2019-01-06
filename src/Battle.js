import {randomFromRange} from './Utils.js';
import * as R from 'ramda';

// Takes array from Enemy entry and generates a random HP value.
const calculateEnemyHP = (enemyHP) =>
  (typeof enemyHP !== 'object') ? enemyHP :
  randomFromRange(...enemyHP);

// Reset battleText
const checkClean = (x) => R.when(needToClean, resetText)(x);
const needToClean = R.propEq('cleanBattleText', true);
const resetText = (x) => R.pipe(clearText, clearTextCheck)(x);
const clearText = R.assoc('battleText', []);
const clearTextCheck = R.assoc('cleanBattleText', false);

/* Battle prep functions */

/**
 * [startBattle description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function startBattle(model) {
  // Clean the battle text
  const cleanModel = checkClean(model);
  if (typeof cleanModel.enemy === 'object') {
    const preparedBattleModel = fightSetup(cleanModel);
    const updatedMsgs = [...preparedBattleModel.battleText, `You are fighting the ${preparedBattleModel.enemy.name}`];
    return {
      model: {...preparedBattleModel, battleText: updatedMsgs},
      initiative: checkInit(preparedBattleModel)};
  } else {
    const updatedMsgs = [...model.battleText, 'Please choose an enemy!'];
    return {...model, battleText: updatedMsgs, cleanBattleText: true};
  }
}

/**
 * [fightSetup description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function fightSetup(model) {
  // Set the HP based on current battle status
  const enemyHP = calculateEnemyHP(model.enemy.hp);
  const enemyWithHP =
  (!model.inBattle) ?
    {...model.enemy, hp: enemyHP, maxhp: enemyHP} :
      model.enemy;
  const playerWithHP =
  (!model.inBattle) ?
    {...model.player, hp: model.player.maxhp} :
      model.player;
  // Set that we're fighting
  return {...model, player: playerWithHP, enemy: enemyWithHP, inBattle: true};
}

/**
 * [checkInit description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function checkInit(model) {
  const {player, enemy} = model;
  const playerInit = player.agility * randomFromRange(0, 255);
  const enemyInit = enemy.agility * randomFromRange(0, 255) * 0.25;
  return enemyInit > playerInit;
}
