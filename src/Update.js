// import * as R from 'ramda';
import {fight} from './Battle.js';

const MSGS = {
  FIGHT: 'FIGHT',
  CHANGE_ARMOR: 'CHANGE_ARMOR',
  CHANGE_ENEMY: 'CHANGE_ENEMY',
  CHANGE_LEVEL: 'CHANGE_LEVEL',
  CHANGE_NAME: 'CHANGE_NAME',
  CHANGE_STATS: 'CHANGE_STATS',
  CHANGE_WEAPON: 'CHANGE_WEAPON',
  FIGHT_CLEANUP: 'FIGHT_CLEANUP',
};
const getSum = (total, num) => total + num;

const fightCleanupMsg = {type: MSGS.FIGHT_CLEANUP};

export function armorMsg(armor) {
  return {
    type: MSGS.CHANGE_ARMOR,
    armor,
  };
}

export function weaponMsg(weapon) {
  return {
    type: MSGS.CHANGE_WEAPON,
    weapon,
  };
}

/**
 * [unitMsg Forms message object for changing the enemy ]
 * @param  {[string]} enemy [Name of the enemy]
 * @return {[object]}      [Complete message object]
 */
export function enemyMsg(enemy) {
  return {
    type: MSGS.CHANGE_ENEMY,
    enemy,
  };
}

/**
 * [levelMsg Forms message object for changing the level]
 * @param  {[int]} level [New level of player]
 * @return {[object]}       [Complete message object]
 */
export function levelMsg(level) {
  return {
    type: MSGS.CHANGE_LEVEL,
    level,
  };
}

/**
 * [nameMsg Forms message object for changing the name]
 * @param  {[string]} name [New name of player]
 * @return {[object]}      [Complete message object]
 */
export function nameMsg(name) {
  return {
    type: MSGS.CHANGE_NAME,
    name,
  };
}

/**
 * [fightMsg Message to start battle]
 * @param  {[object]} player [The player object]
 * @param  {[string]} enemy  [The enemy's name string]
 * @return {[object]}        [Completed message object]
 */
export function fightMsg(player, enemy) {
  return {
    type: MSGS.FIGHT,
    player,
    enemy,
  };
}

const statsMsg = {type: MSGS.CHANGE_STATS};

/**
 * [update Handles the update messages. Source of impurity]
 * @param  {[Message]} msg   [current Message]
 * @param  {[object]} model [current Model]
 * @return {[object]}       [updated Model]
 */
function update(msg, model) {
  const messageQueue = [];
  messageQueue.push(msg);
  while (messageQueue.length !== 0) {
    const msg = messageQueue.pop();
    // console.log(msg);
    switch (msg.type) {
      case MSGS.FIGHT: {
        const {cleanBattleText} = model;
        if (cleanBattleText) {
          model = {...model, battleText: [], cleanBattleText: false};
        }
        const {player, enemy} = msg;
        const currRoundEnemy = (typeof enemy === 'string') ? model.enemy[enemy] : enemy;
        const finishRound = fight(player, currRoundEnemy);
        const {playerAfterRound,
          enemyAfterRound,
          playerBattleText,
          enemyBattleText,
          battleState} = finishRound;
        if (!battleState) {
          messageQueue.push(fightCleanupMsg);
        }
        const updatedMsgs = [...model.battleText,
          playerBattleText,
          enemyBattleText];
        model = {...model, battleText: updatedMsgs,
          currentEnemy: enemyAfterRound,
          player: playerAfterRound,
          inBattle: battleState};
        break;
      }

      case MSGS.FIGHT_CLEANUP: {
        messageQueue.push(statsMsg);
        model = {...model,
          currentEnemy: '',
          cleanBattleText: true,
        };
        break;
      }

      case MSGS.CHANGE_NAME: {
        const {name} = msg;
        const {sum, type} = changeName(name);
        const updatedPlayer =
        {...model.player, name: name, nameSum: sum, progression: type};
        model = {...model, player: updatedPlayer};
        messageQueue.push(statsMsg);
        break;
      }

      case MSGS.CHANGE_WEAPON: {
        const {weapon} = msg;
        const updatedPlayer = {...model.player, weapon: model.weapons[weapon]};
        model = {...model, player: updatedPlayer};
        break;
      }

      case MSGS.CHANGE_ARMOR: {
        const {armor} = msg;
        const updatedPlayer = {...model.player, armor: model.armors[armor]};
        model = {...model, player: updatedPlayer};
        break;
      }

      case MSGS.CHANGE_ENEMY: {
        const {enemy} = msg;
        model = {...model, currentEnemy: enemy};
        break;
      }

      case MSGS.CHANGE_LEVEL: {
        const {level} = msg;
        const updatedPlayer = {...model.player, level: level};
        model = {...model, player: updatedPlayer};
        messageQueue.push(statsMsg);
        break;
      }

      case MSGS.CHANGE_STATS: {
        const player = model.player;
        const {nameSum, progression, level} = player;
        const baseLevelStats = model.levels[level];
        const newStats = changeStats(nameSum, progression, baseLevelStats);
        const [newStr, newAgi, newHP, newMP] = newStats;
        const updatedPlayer = {...player,
          strength: newStr,
          agility: newAgi,
          hp: newHP,
          mp: newMP};
        model = {...model, player: updatedPlayer};
        break;
      }
      default:
        console.log('Got to default in update function');
        console.log('Attempted message was ' + msg);
        return model;
    }
  }
  return model;
}

/**
 * [changeStats Generates new stats based on name and level]
 * @param  {[integer]} nameSum        [Number dervived from name as a modifier]
 * @param  {[integer]} progression    [Number marking progression type]
 * @param  {[object]} baseLevelStats [Array of base statistics for the level]
 * @return {[object]}                [New player statstics set]
 */
function changeStats(nameSum, progression, baseLevelStats) {
  const [strength, agility, hp, mp] = baseLevelStats;
  const newStats = [];
  switch (progression) {
    case 0: // long term HP/MP, short term Str and Agi
      newStats.push(Math.floor((strength * (9/10)) +
      (Math.floor(nameSum/4)) % 4)),
      newStats.push(Math.floor((agility * (9/10)) +
       (Math.floor(nameSum/4)) % 4)),
      newStats.push(hp);
      newStats.push(mp);
      break;
    case 1: // long term Strength and HP, short term Agi and MP
      newStats.push(strength);
      newStats.push(Math.floor((agility * (9/10)) +
      (Math.floor(nameSum/4)) % 4));
      newStats.push(hp);
      newStats.push(Math.floor((mp * (9/10)) +
      (Math.floor(nameSum/4)) % 4));
      break;
    case 2: // Long term Agi and MP, short term Str and HP
      newStats.push(Math.floor((strength * (9/10)) +
      (Math.floor(nameSum/4)) % 4)),
      newStats.push(agility);
      newStats.push(Math.floor((hp * (9/10)) +
      (Math.floor(nameSum/4)) % 4)),
      newStats.push(mp);
      break;
    case 3: // Long term str and agi, short term hp and mp
      newStats.push(strength);
      newStats.push(agility);
      newStats.push(Math.floor((hp * (9/10)) +
      (Math.floor(nameSum/4)) % 4)),
      newStats.push(Math.floor((mp * (9/10)) +
      (Math.floor(nameSum/4)) % 4));
      break;
    default:
      console.log('Something went wrong with the progression calculations!');
      break;
  }
  return newStats;
}

// Such a stupid function, but necessary for simulation
/**
 * [changeName computes the necessary variables for
 *  stat computation based on name]
 * @param  {[string]} name [Player's name]
 * @return {[object]}      [Name sum and progression type]
 */
function changeName(name) {
  const letters = name.split('').slice(0, 4); // Get the first four letters of the name.
  // The columns of the name entry screen  in the original game
  // correspond to different numbers. I'm omitting the punctuation
  // and defaulting everything to 0 that isn't a lower or uppercase letter.
  const sum = letters.map((x) => {
    if ('gwM'.indexOf(x) > -1) return 0;
    if ('hxN'.indexOf(x) > -1) return 1;
    if ('iyO'.indexOf(x) > -1) return 2;
    if ('jzP'.indexOf(x) > -1) return 3;
    if ('kAQ'.indexOf(x) > -1) return 4;
    if ('lBR'.indexOf(x) > -1) return 5;
    if ('mCS'.indexOf(x) > -1) return 6;
    if ('nDT'.indexOf(x) > -1) return 7;
    if ('oEU'.indexOf(x) > -1) return 8;
    if ('pFV'.indexOf(x) > -1) return 9;
    if ('aqGW'.indexOf(x) > -1) return 10;
    if ('brHX'.indexOf(x) > -1) return 11;
    if ('csIY'.indexOf(x) > -1) return 12;
    if ('dtJZ'.indexOf(x) > -1) return 13;
    if ('euK'.indexOf(x) > -1) return 14;
    if ('fvL'.indexOf(x) > -1) return 15;
    return 0;
  }
  ).reduce(getSum);
  // Get the progression type, an integer from 0 to 3
  const type = Math.floor(sum % 4);
  return {sum, type};
}

export default update;
