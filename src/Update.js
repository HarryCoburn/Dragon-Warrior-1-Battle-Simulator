// import * as R from 'ramda';
import {startBattle, startPlayerRound, startEnemyRound} from './Battle.js';
import {changeWeapon, changeArmor, changeShield} from './Inventory.js';
import {changeStats, changeName} from './Stats.js';
import {changeEnemy} from './Enemies.js';

const MSGS = {
  CAST_HEAL: 'CAST_HEAL',
  CAST_HEALMORE: 'CAST_HEALMORE',
  CAST_HURT: 'CAST_HURT',
  CAST_HURTMORE: 'CAST_HURTMORE',
  CAST_SLEEP: 'CAST_SLEEP',
  CAST_STOPSPELL: 'CAST_STOPSPELL',
  CHANGE_ARMOR: 'CHANGE_ARMOR',
  CHANGE_ENEMY: 'CHANGE_ENEMY',
  CHANGE_HERB: 'CHANGE_HERB',
  CHANGE_LEVEL: 'CHANGE_LEVEL',
  CHANGE_NAME: 'CHANGE_NAME',
  CHANGE_SHIELD: 'CHANGE_SHIELD',
  CHANGE_STATS: 'CHANGE_STATS',
  CHANGE_WEAPON: 'CHANGE_WEAPON',
  ENEMY_TURN: 'ENEMY_TURN',
  FIGHT: 'FIGHT',
  FIGHT_CLEANUP: 'FIGHT_CLEANUP',
  START_BATTLE: 'START_BATTLE',
  USE_HERB: 'USE_HERB',
};

const capitalize = (x) => x.charAt(0).toUpperCase() + x.slice(1);

/**
 * [healmoreMsg description]
 * @param  {[type]} hp    [description]
 * @param  {[type]} maxhp [description]
 * @return {[type]}       [description]
 */
export function healmoreMsg(hp, maxhp) {
  return {
    type: MSGS.CAST_HEALMORE,
    hp,
    maxhp,
  };
}
/**
 * [healMsg description]
 * @param  {[type]} hp [description]
 * @param  {[type]} maxhp [description]
 * @return {[type]}    [description]
 */
export function healMsg(hp, maxhp) {
  return {
    type: MSGS.CAST_HEAL,
    hp,
    maxhp,
  };
}

/**
 * [shieldMsg description]
 * @param  {[type]} shield [description]
 * @return {[type]}        [description]
 */
export function shieldMsg(shield) {
  return {
    type: MSGS.CHANGE_SHIELD,
    shield,
  };
}

/**
 * [changeHerb description]
 * @param  {[type]} herb [description]
 * @return {[type]}      [description]
 */
export function herbMsg(herb) {
  return {
    type: MSGS.CHANGE_HERB,
    herb,
  };
}

/**
 * [armorMsg description]
 * @param  {[type]} armor [description]
 * @return {[type]}       [description]
 */
export function armorMsg(armor) {
  return {
    type: MSGS.CHANGE_ARMOR,
    armor,
  };
}

/**
 * [weaponMsg description]
 * @param  {[type]} weapon [description]
 * @return {[type]}        [description]
 */
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
export const startBattleMsg = {type: MSGS.START_BATTLE};
const statsMsg = {type: MSGS.CHANGE_STATS};
const fightCleanupMsg = {type: MSGS.FIGHT_CLEANUP};
const enemyTurnMsg = {type: MSGS.ENEMY_TURN};
export const hurtMsg = {type: MSGS.CAST_HURT};
export const sleepMsg = {type: MSGS.CAST_SLEEP};
export const hurtmoreMsg = {type: MSGS.CAST_HURTMORE};
export const stopspellMsg = {type: MSGS.CAST_STOPSPELL};
export const useHerbMsg = {type: MSGS.USE_HERB};

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
    console.log(msg);
    console.log('Entering update with this model');
    console.log(model);
    switch (msg.type) {
      case MSGS.START_BATTLE: {
        const battleStart = startBattle(model);
        model = battleStart.model;
        const updatedText = [...model.battleText];
        const enemyInit = battleStart.initiative;
        if (enemyInit) {
          updatedText.push(`The enemy gets to go first!`);
          model = {...model, battleText: updatedText};
          messageQueue.push(enemyTurnMsg);
        }
        break;
      }

      case MSGS.CAST_HURT:
      case MSGS.CAST_HURTMORE:
      case MSGS.CAST_HEAL:
      case MSGS.CAST_HEALMORE:
      case MSGS.CAST_SLEEP:
      case MSGS.CAST_STOPSPELL:
      case MSGS.FIGHT:
      case MSGS.USE_HERB: {
        model = startPlayerRound(model, msg);
        const {inBattle} = model;
        if (!inBattle) {
          messageQueue.push(fightCleanupMsg);
        } else {
          messageQueue.push(enemyTurnMsg);
        }
        break;
      }

      case MSGS.ENEMY_TURN: {
        const enemyRound = startEnemyRound(model);
        model = enemyRound;
        if (!model.inBattle) {
          messageQueue.push(fightCleanupMsg);
        }
        break;
      }

      case MSGS.FIGHT_CLEANUP: {
        messageQueue.push(statsMsg);
        const enemyName = capitalize(model.enemy.name);
        messageQueue.push(enemyMsg(enemyName));
        model = {...model,
          cleanBattleText: true,
          enemySleep: 0,
          enemyStop: false,
          playerSleep: false,
          sleepCount: 6,
        };
        break;
      }

      case MSGS.CHANGE_NAME: {
        model = {...model, player: changeName(msg, model)};
        messageQueue.push(statsMsg);
        break;
      }
      case MSGS.CHANGE_WEAPON: {
        model = {...model, player: changeWeapon(msg, model)};
        break;
      }
      case MSGS.CHANGE_ARMOR: {
        model = {...model, player: changeArmor(msg, model)};
        break;
      }
      case MSGS.CHANGE_SHIELD: {
        model = {...model, player: changeShield(msg, model)};
        break;
      }
      case MSGS.CHANGE_ENEMY: {
        model = {...model, enemy: changeEnemy(msg)};
        break;
      }
      case MSGS.CHANGE_LEVEL: {
        const {level} = msg;
        const updatedPlayer = {...model.player, level: level};
        model = {...model, player: updatedPlayer};
        messageQueue.push(statsMsg);
        break;
      }
      case MSGS.CHANGE_HERB: {
        const {herb} = msg;
        const updatedPlayer = {...model.player, herbCount: herb};
        model = {...model, player: updatedPlayer};
        break;
      }
      case MSGS.CHANGE_STATS: {
        console.log('Entering Change Stats');
        console.log(model);
        model = {...model, player: changeStats(model)};
        break;
      }
      default:
        console.log('Got to default in update function');
        console.log('Attempted message was ' + msg);
        return model;
    }
  }
  console.log('Exiting update with this model:');
  console.log(model);
  return model;
};

export default update;
