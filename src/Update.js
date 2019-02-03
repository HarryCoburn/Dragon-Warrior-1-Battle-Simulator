import * as R from "ramda";
import startBattle from "./Battle";
import { startPlayerRound } from "./PlayerAttack";
import startEnemyRound from "./EnemyAttack";
import { changeWeapon, changeArmor, changeShield } from "./Inventory";
import { changeStats, changeName } from "./Stats";
import changeEnemy from "./Enemies";

const MSGS = {
  CAST_HEAL: "CAST_HEAL",
  CAST_HEALMORE: "CAST_HEALMORE",
  CAST_HURT: "CAST_HURT",
  CAST_HURTMORE: "CAST_HURTMORE",
  CAST_SLEEP: "CAST_SLEEP",
  CAST_STOPSPELL: "CAST_STOPSPELL",
  CHANGE_ARMOR: "CHANGE_ARMOR",
  CHANGE_ENEMY: "CHANGE_ENEMY",
  CHANGE_HERB: "CHANGE_HERB",
  CHANGE_LEVEL: "CHANGE_LEVEL",
  CHANGE_NAME: "CHANGE_NAME",
  CHANGE_SHIELD: "CHANGE_SHIELD",
  CHANGE_STATS: "CHANGE_STATS",
  CHANGE_WEAPON: "CHANGE_WEAPON",
  ENEMY_TURN: "ENEMY_TURN",
  FIGHT: "FIGHT",
  FIGHT_CLEANUP: "FIGHT_CLEANUP",
  RUN_AWAY: "RUN_AWAY",
  START_BATTLE: "START_BATTLE",
  USE_HERB: "USE_HERB"
};

/**
 * [shieldMsg description]
 * @param  {[type]} shield [description]
 * @return {[type]}        [description]
 */
export function shieldMsg(shield) {
  return {
    type: MSGS.CHANGE_SHIELD,
    shield
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
    herb
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
    armor
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
    weapon
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
    enemy
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
    level
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
    name
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
    enemy
  };
}
/**
 * [healmoreMsg description]
 * @param  {[type]} hp    [description]
 * @param  {[type]} maxhp [description]
 * @return {[type]}       [description]
 */

const statsMsg = { type: MSGS.CHANGE_STATS };
const fightCleanupMsg = { type: MSGS.FIGHT_CLEANUP };
const enemyTurnMsg = { type: MSGS.ENEMY_TURN };
export const hurtMsg = { type: MSGS.CAST_HURT };
export const sleepMsg = { type: MSGS.CAST_SLEEP };
export const hurtmoreMsg = { type: MSGS.CAST_HURTMORE };
export const stopspellMsg = { type: MSGS.CAST_STOPSPELL };
export const useHerbMsg = { type: MSGS.USE_HERB };
export const runMsg = { type: MSGS.RUN_AWAY };
export const healmoreMsg = { type: MSGS.CAST_HEALMORE };
export const healMsg = { type: MSGS.CAST_HEAL };
export const startBattleMsg = { type: MSGS.START_BATTLE };

/**
 * [update Handles the update messages. Source of impurity]
 * @param  {[Message]} msg   [current Message]
 * @param  {[object]} model [current Model]
 * @return {[object]}       [updated Model]
 */
function update(msg, model) {
  let currModel = model;
  const messageQueue = [];
  messageQueue.push(msg);
  while (messageQueue.length !== 0) {
    const currMsg = messageQueue.pop();
    console.log(currMsg);
    switch (currMsg.type) {
      case MSGS.START_BATTLE: {
        currModel = startBattle(model);
        const enemyInit = model.initiative;
        if (enemyInit) {
          const updatedText = [...currModel.battleText];
          updatedText.push(`The enemy gets to go first!`);
          currModel = { ...currModel, battleText: updatedText };
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
      case MSGS.USE_HERB:
      case MSGS.RUN_AWAY: {
        currModel = startPlayerRound(currModel, msg);
        const { inBattle } = currModel;
        R.equals(inBattle, false)
          ? messageQueue.push(fightCleanupMsg)
          : messageQueue.push(enemyTurnMsg);
        break;
      }

      case MSGS.ENEMY_TURN: {
        const enemyRound = startEnemyRound(currModel);
        currModel = enemyRound;
        R.when(
          R.equals(currModel.inBattle, false),
          messageQueue.push(fightCleanupMsg)
        );
        break;
      }

      case MSGS.FIGHT_CLEANUP: {
        messageQueue.push(statsMsg); // Reset player stats
        messageQueue.push(enemyMsg(currModel.enemy.name)); // Reset enemy stats
        currModel = {
          ...currModel,
          cleanBattleText: true,
          enemySleep: 0,
          enemyStop: false,
          playerSleep: false,
          playerStop: false,
          sleepCount: 6,
          initiative: false,
          critHit: false
        };
        break;
      }

      case MSGS.CHANGE_NAME: {
        currModel = { ...currModel, player: changeName(currMsg, currModel) };
        messageQueue.push(statsMsg);
        break;
      }
      case MSGS.CHANGE_WEAPON: {
        currModel = { ...model, player: changeWeapon(currMsg, currModel) };
        break;
      }
      case MSGS.CHANGE_ARMOR: {
        currModel = { ...currModel, player: changeArmor(currMsg, currModel) };
        break;
      }
      case MSGS.CHANGE_SHIELD: {
        currModel = { ...currModel, player: changeShield(currMsg, currModel) };
        break;
      }
      case MSGS.CHANGE_ENEMY: {
        currModel = { ...currModel, enemy: changeEnemy(currMsg) };
        break;
      }
      case MSGS.CHANGE_LEVEL: {
        const { level } = currMsg;
        const updatedPlayer = { ...currModel.player, level };
        currModel = { ...currModel, player: updatedPlayer };
        messageQueue.push(statsMsg);
        break;
      }
      case MSGS.CHANGE_HERB: {
        const { herb } = currMsg;

        const updatedPlayer = { ...currModel.player, herbCount: herb };

        currModel = { ...currModel, player: updatedPlayer };

        break;
      }
      case MSGS.CHANGE_STATS: {
        currModel = { ...currModel, player: changeStats(currModel) };
        break;
      }
      default:
        console.log("Got to default in update function");
        console.log(`Attempted message was ${msg.type}`);
        return currModel;
    }
  }
  return currModel;
}

export default update;
