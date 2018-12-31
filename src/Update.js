// import * as R from 'ramda';
import {cleanBattleText, startFight, startEnemyRound} from './Battle.js';
import {changeWeapon, changeArmor, changeShield} from './Inventory.js';
import {changeStats, changeName} from './Stats.js';
import {changeEnemy} from './Enemies.js';

const MSGS = {
  CAST_HEAL: 'CAST_HEAL',
  CAST_HEALMORE: 'CAST_HEALMORE',
  CAST_HURT: 'CAST_HURT',
  CAST_HURTMORE: 'CAST_HURTMORE',
  CAST_SPELL: 'CAST_SPELL',
  CHANGE_ARMOR: 'CHANGE_ARMOR',
  CHANGE_ENEMY: 'CHANGE_ENEMY',
  CHANGE_LEVEL: 'CHANGE_LEVEL',
  CHANGE_NAME: 'CHANGE_NAME',
  CHANGE_SHIELD: 'CHANGE_SHIELD',
  CHANGE_STATS: 'CHANGE_STATS',
  CHANGE_WEAPON: 'CHANGE_WEAPON',
  ENEMY_TURN: 'ENEMY_TURN',
  FIGHT: 'FIGHT',
  FIGHT_CLEANUP: 'FIGHT_CLEANUP',
};

const capitalize = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const playerHeal = [10, 17];
const playerHealmore = [85, 100];
const playerHurt = [5, 12];
const playerHurtmore = [58, 65];
const getRandomArbitrary = (min, max) =>
  Math.random() * (max - min) + min;
const healCost = 4;
const hurtCost = 2;
const healmoreCost = 10;
const hurtmoreCost = 5;
const stopspellCost = 2;
const sleep = 2;

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
 * @return {[type]}    [description]
 */
export function healMsg(hp, maxhp) {
  return {
    type: MSGS.CAST_SPELL,
    spell: MSGS.CAST_HEAL,
    hp,
    maxhp,
  };
}
export function shieldMsg(shield) {
  return {
    type: MSGS.CHANGE_SHIELD,
    shield,
  };
}
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
const fightCleanupMsg = {type: MSGS.FIGHT_CLEANUP};
const enemyTurnMsg = {type: MSGS.ENEMY_TURN};
export const hurtMsg = {type: MSGS.CAST_HURT};
export const hurtmoreMsg = {type: MSGS.CAST_HURTMORE};

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
    switch (msg.type) {
      case MSGS.CAST_HURTMORE: {
        const {enemy, player} = model;
        const {hp} = enemy;
        const {mp} = player;
        if (mp < hurtmoreCost) {
          const updatedText = [...model.battleText, `Player tries to cast Hurtmore, but doesn't have enough MP!`];
          messageQueue.push(enemyTurnMsg);
          model = {...model, battleText: updatedText};
        } else {
          const hurtDamage = Math.floor(getRandomArbitrary(playerHurtmore[0], playerHurtmore[1]));
          const newHP = hp - hurtCost;
          const updatedText = [...model.battleText];
          updatedText.push(`Player casts Hurtmore! ${capitalize(enemy.name)} is hurt by ${hurtDamage} hit points`);
          // Handle wins
          const newEnemy = {...enemy, hp: newHP};
          messageQueue.push(enemyTurnMsg);
          model = {...model, enemy: newEnemy, battleText: updatedText};
        }
        break;
      }

      case MSGS.CAST_HURT: {
        const {enemy, player} = model;
        const {hp} = enemy;
        const {mp} = player;
        if (mp < hurtCost) {
          const updatedText = [...model.battleText, `Player tries to cast Hurt, but doesn't have enough MP!`];
          messageQueue.push(enemyTurnMsg);
          model = {...model, battleText: updatedText};
        } else {
          const hurtDamage = Math.floor(getRandomArbitrary(playerHurt[0], playerHurt[1]));
          const newHP = hp - hurtCost;
          const updatedText = [...model.battleText];
          updatedText.push(`Player casts Hurt! ${capitalize(enemy.name)} is hurt by ${hurtDamage} hit points`);
          // Handle wins
          const newEnemy = {...enemy, hp: newHP};
          messageQueue.push(enemyTurnMsg);
          model = {...model, enemy: newEnemy, battleText: updatedText};
        }
        break;
      }

      case MSGS.CAST_HEAL: { // TODO, move to battle.js, merge with healmore code
        const {hp, maxhp} = msg;
        const {mp} = model.player;
        if (mp < healCost) {
          const updatedText = [...model.battleText, `Player tries to cast Heal, but doesn't have enough MP!`];
          messageQueue.push(enemyTurnMsg);
          model = {...model, battleText: updatedText};
        } else {
          const newMP = mp - healCost;
          const healMax = maxhp - hp;
          const healAmt =
          Math.floor(getRandomArbitrary(playerHeal[0], playerHeal[1]));
          const finalHeal = (healMax < healAmt) ? healMax : healAmt;
          const newPlayerHP = hp + finalHeal;
          const updatedText = [...model.battleText];
          if (finalHeal === 0) {
            updatedText.push(`Player casts Heal! But their hit points were already at maximum!`);
          } else {
            updatedText.push(`Player casts Heal! Player is healed ${finalHeal} hit points`);
          }
          const updatedPlayer = {...model.player, hp: newPlayerHP, mp: newMP};
          messageQueue.push(enemyTurnMsg);
          model = {...model, player: updatedPlayer, battleText: updatedText};
        }
        break;
      }

      case MSGS.CAST_HEALMORE: {
        const {hp, maxhp} = msg;
        const {mp} = model.player;
        if (mp < healmoreCost) {
          const updatedText = [...model.battleText, `Player tries to cast Healmore, but doesn't have enough MP!`];
          messageQueue.push(enemyTurnMsg);
          model = {...model, battleText: updatedText};
        } else {
          const newMP = mp - healmoreCost;
          const healMax = maxhp - hp;
          const healAmt =
          Math.floor(getRandomArbitrary(playerHealmore[0], playerHealmore[1]));
          const finalHeal = (healMax < healAmt) ? healMax : healAmt;
          const newPlayerHP = hp + finalHeal;
          const updatedText = [...model.battleText];
          if (finalHeal === 0) {
            updatedText.push(`Player casts Healmore! But their hit points were already at maximum!`);
          } else {
            updatedText.push(`Player casts Healmore! Player is healed ${finalHeal} hit points`);
          }
          const updatedPlayer = {...model.player, hp: newPlayerHP, mp: newMP};
          messageQueue.push(enemyTurnMsg);
          model = {...model, player: updatedPlayer, battleText: updatedText};
        }
        break;
      }

      case MSGS.FIGHT: {
        model = cleanBattleText(model);
        if ((typeof model.enemy === 'string' && model.enemy !== '') || typeof model.enemy === 'object') {
          const currRoundEnemy = (typeof model.enemy === 'object') ? model.enemy : model.enemies[model.enemy];
          const modelWithEnemy = {...model, enemy: currRoundEnemy};
          // Now the player will have their turn...
          const playerRound = startFight(modelWithEnemy);
          const {player,
            enemy,
            battleText,
            inBattle} = playerRound;
          if (!inBattle) {
            messageQueue.push(fightCleanupMsg);
          } else {
            messageQueue.push(enemyTurnMsg);
          }
          model = {...model, battleText: battleText,
            enemy: enemy,
            player: player,
            inBattle: inBattle};
        } else {
          const updatedMsgs = [...model.battleText, 'Please choose an enemy!'];
          model = {...model, battleText: updatedMsgs, cleanBattleText: true};
        }
        break;
      }

      case MSGS.ENEMY_TURN: {
        const enemyRound = startEnemyRound(model);
        const {player,
          enemy,
          battleText,
          inBattle} = enemyRound;
        if (!inBattle) {
          messageQueue.push(fightCleanupMsg);
        }
        model = {...model, battleText: battleText,
          enemy: enemy,
          player: player,
          inBattle: inBattle};
        break;
      }

      case MSGS.FIGHT_CLEANUP: {
        messageQueue.push(statsMsg);
        model = {...model,
          enemy: '',
          cleanBattleText: true,
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
      case MSGS.CHANGE_STATS: {
        model = {...model, player: changeStats(model)};
        break;
      }
      default:
        console.log('Got to default in update function');
        console.log('Attempted message was ' + msg);
        return model;
    }
  }
  return model;
};

export default update;
