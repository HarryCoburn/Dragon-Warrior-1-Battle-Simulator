import {capitalize, randomFromRange} from './Utils.js';

// Define low damage range
const lowDamageRange = (x) => [minDamageHighDefense, maxDamageHighDefense(x)];
const minDamageHighDefense = 0;
const maxDamageHighDefense = (x) => (x+4) / 6;

// Define normal damage range
const normalDamageRange = (x, y) => [minDamage(x, y), maxDamage(x, y)];
const minDamage = (x, y) => (x - (y/2)) / 4;
const maxDamage = (x, y) => (x - (y/2)) / 2;

// Takes an AI pattern and sums the weights up.
const sumOfWeights = (enemyAI) => enemyAI.reduce(function(memo, entry) {
  return memo + entry.weight;
}, 0);

/**
 * [getAttack Gets an attack from the enemy's AI pattern based on weight. CURRENTLY IMPURE.]
 * @param  {[type]} sumOfWeights [description]
 * @return {[type]}              [description]
 */
function getAttack(sumOfWeights) {
  let random = Math.floor(Math.random() * (sumOfWeights + 1));

  return function(attack) {
    random -= attack.weight;
    return random <= 0;
  };
}

/* The Enemy's Round */

/**
 * [startEnemyRound description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function startEnemyRound(model) {
  const {player, enemy} = model;
  const wakeChance = 3;
  const {enemySleep} = model;
  const updatedText = [...model.battleText];
  // Sleep Check
  if (enemySleep > 0) {
    if (enemySleep === 2) { // Free round
      updatedText.push(`The ${enemy.name} is asleep.`);
      return {...model, battleText: updatedText, enemySleep: 1};
    } else {
      const wokeUp = (randomFromRange(1, wakeChance) === wakeChance);
      if (wokeUp) {
        updatedText.push(`The ${model.enemy.name} woke up!`);
      } else {
        updatedText.push(`The ${model.enemy.name} is still asleep...`);
        return {...model, battleText: updatedText};
      }
    }
  }
  // Run check
  if (player.strength >= enemy.strength * 2) {
    const enemyRun = randomFromRange(1, 4) === 4;
    if (enemyRun) {
      updatedText.push(`The enemy flees from your superior strength!`);
      return {...model,
        battleText: updatedText, enemySleep: 0, inBattle: false};
    }
  }
  return enemyRound({...model, battleText: updatedText, enemySleep: 0});
}

/**
 * [enemyRound description]
 * @param  {[type]} model     [description]
 * @param  {[type]} aiPattern [description]
 * @return {[type]}           [description]
 */
function enemyRound(model, aiPattern) {
  const {enemy, playerSleep} = model;
  if (aiPattern === undefined) {
    aiPattern = enemy.pattern;
  }
  const chosenAttack = aiPattern.find(getAttack(sumOfWeights(aiPattern))).id;
  switch (chosenAttack) {
    case 'ATTACK': {
      const roundDone = enemyAttack(model);
      return roundDone;
      break;
    }
    case 'HURT': {
      const roundDone = enemyHurt(model, false);
      return roundDone;
      break;
    }
    case 'HURTMORE': {
      const roundDone = enemyHurt(model, true);
      return roundDone;
      break;
    }
    case 'HEAL':
    case 'HEALMORE': {
      const willHeal = (enemy.hp / enemy.maxhp < 0.25) ? true : false;
      if (willHeal) {
        const roundDone = (chosenAttack === 'HEAL') ? enemyHeal(model, false) : enemyHeal(model, true);
        return roundDone;
      } else {
        console.log('Trying to make new AI pattern');
        const newAIPattern = aiPattern.filter((item) => item.id !== 'HEAL' || item.id !== 'HEALMORE');
        return enemyRound(model, newAIPattern);
      }
      break;
    }
    case 'SLEEP': {
      if (playerSleep) {
        const newAIPattern = aiPattern.filter((item) => item.id !== 'SLEEP');
        return enemyRound(model, newAIPattern);
      } else {
        return enemySleep(model);
      }
      break;
    }
    case 'STOPSPELL': {
      if (playerStop) {
        const newAIPattern = aiPattern.filter((item) => item.id !== 'STOPSPELL');
        return enemyRound(model, newAIPattern);
      } else {
        return enemyStop(model);
      }
      break;
    }
    case 'FIRE': {
      const roundDone = enemyFire(model, false);
      return roundDone;
      break;
    }
    case 'STRONGFIRE': {
      const roundDone = enemyFire(model, true);
      return roundDone;
      break;
    }
  }
}

/**
 * [enemyAttack description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function enemyAttack(model) {
  const {player, enemy} = model;
  const damageToPlayer = enemyDamage(player, enemy);
  const playerAfterRound = {...player, hp: player.hp - damageToPlayer};
  const afterEnemyRoundModel = {...model, player: playerAfterRound};
  return enemyBattleMessages(afterEnemyRoundModel, damageToPlayer);
}

/**
 * [enemyDamage description]
 * @param  {[type]} player [description]
 * @param  {[type]} enemy  [description]
 * @return {[type]}        [description]
 */
function enemyDamage(player, enemy) {
  // Basic enemy attack calculations
  const enemyAttack = enemy.strength;
  const heroDefense =
    Math.floor((player.agility + player.armor.mod + player.shield.mod)/2);
  const heroHighDefense = heroDefense >= enemyAttack;
  // Enemy attack range calculation
  if (heroHighDefense) {
    return randomFromRange(...lowDamageRange(enemyAttack));
  } else {
    return randomFromRange(...normalDamageRange(enemyAttack, heroDefense));
  }
}

/**
 * [enemyBattleMessages description]
 * @param  {[type]} model  [description]
 * @param  {[type]} damage [description]
 * @return {[type]}        [description]
 */
function enemyBattleMessages(model, damage) {
  const {player, enemy, battleText} = model;
  battleText.push(
      `${capitalize(enemy.name)} attacks! ${capitalize(enemy.name)} hits you for ${damage} points of damage`);
  if (player.hp <= 0) {
    battleText.push(
        `You have been defeated by the ${enemy.name}!`);
    return {...model,
      battleText,
      inBattle: false};
  }
  return {...model,
    battleText,
  };
}

/**
 * [enemyHurt description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHurtmore [description]
 * @return {[type]}             [description]
 */
function enemyHurt(model, isHurtmore) {
  const eHurtRange = [3, 10];
  const eHurtmoreRange = [30, 45];
  const eHurtRangeLow = [2, 6];
  const eHurtmoreRangeLow = [20, 30];
  const spellName = (isHurtmore) ? 'Hurtmore' : 'Hurt';
  const {enemy, player, enemyStop} = model;
  const {hp, armor} = player;
  const magicDefense = armor.magDef;
  const hurtDamage = (isHurtmore) ?
    (magicDefense) ?
      randomFromRange(...eHurtmoreRangeLow) :
      randomFromRange(...eHurtmoreRange) :
    (magicDefense) ?
    randomFromRange(...eHurtRangeLow) :
    randomFromRange(...eHurtRange);
  const newHP = hp - hurtDamage;
  const updatedText = [...model.battleText];
  updatedText.push(`${capitalize(enemy.name)} casts ${spellName}!`);
  if (enemyStop) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return {...model, battleText: updatedText};
  }
  updatedText.push(` Player is hurt by ${hurtDamage} hit points.`);
  const battleState = (newHP <= 0) ? false : true;
  const newPlayer = {...player, hp: newHP};
  if (newHP <= 0) {
    updatedText.push(`You have been defeated by the ${capitalize(enemy.name)}.`);
  }
  return {...model,
    player: newPlayer,
    battleText: updatedText, inBattle: battleState};
}

/**
 * [enemyHeal description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHealmore [description]
 * @return {[type]}             [description]
 */
function enemyHeal(model, isHealmore) {
  const eHealRange = [20, 27];
  const eHealmoreRange = [85, 100];
  const {enemy} = model;
  const {hp, maxhp} = enemy;
  const spellName = (isHealmore) ? 'Healmore' : 'Heal';
  const healMax = maxhp - hp;
  const healAmt = (isHealmore) ?
    randomFromRange(...eHealmoreRange) :
    randomFromRange(...eHealRange);
  const finalHeal = (healMax < healAmt) ? healMax : healAmt;
  const updatedText = [...model.battleText];
  updatedText.push(`${capitalize(enemy.name)} casts ${spellName}!`);
  if (enemyStop) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return {...model, battleText: updatedText};
  }
  const newEnemyHP = hp + finalHeal;
  updatedText.push(`${capitalize(enemy.name)} is healed ${finalHeal} hit points`);
  const updatedEnemy = {...model.enemy, hp: newEnemyHP};
  return {...model, enemy: updatedEnemy, battleText: updatedText};
}

/**
 * [enemySleep description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function enemySleep(model) {
  const {enemy} = model;
  const updatedText = [...model.battleText];
  updatedText.push(`The ${enemy.name} casts Sleep!`);
  if (enemyStop) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return {...model, battleText: updatedText};
  }
  updatedText.push(`You fall asleep!`);
  return {...model, playerSleep: true};
}

/**
 * [enemyStop description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function enemyStop(model) {
  const {enemy} = model;
  const updatedText = [...model.battleText];
  updatedText.push(`The ${enemy.name} casts Stopspell!`);
  if (enemyStop) {
    updatedText.push(`However, ${capitalize(enemy.name)}'s magic is blocked!`);
    return {...model, battleText: updatedText};
  }
  if (coinflip()) {
    updatedText.push(`Your magic has been blocked!`);
    return {...model, battleText: updatedText, playerBlock: true};
  } else {
    updatedText.push(`But the spell fails!`);
    return {...model, battleText: updatedText};
  }
}

/**
 * [enemyFire description]
 * @param  {[type]}  model        [description]
 * @param  {Boolean} isStrongfire [description]
 * @return {[type]}               [description]
 */
function enemyFire(model, isStrongfire) {
  const eFireRange = [16, 23];
  const eStrongfireRange = [65, 72];
  const eFireRangeLow = [10, 14];
  const eStrongfireRangeLow = [42, 48];
  const {enemy, player} = model;
  const {hp, armor} = player;
  const spellName = (isStrongfire) ? 'strong flames at you!' : 'fire';
  const fireDefense = armor.fireDef;
  const fireDamage = (isStrongfire) ?
      (fireDefense) ?
        randomFromRange(...eStrongfireRangeLow) :
        randomFromRange(...eStrongfireRange) :
      (fireDefense) ?
      randomFromRange(...eFireRangeLow) :
      randomFromRange(...eFireRange);
  const newHP = hp - fireDamage;
  const updatedText = [...model.battleText];
  updatedText.push(`${capitalize(enemy.name)} breathes ${spellName}!`);
  updatedText.push(` Player is hurt by ${fireDamage} hit points.`);
  const battleState = (newHP <= 0) ? false : true;
  const newPlayer = {...player, hp: newHP};
  if (newHP <= 0) {
    updatedText.push(`You have been defeated by the ${capitalize(enemy.name)}.`);
  }
  return {...model,
    player: newPlayer,
    battleText: updatedText, inBattle: battleState};
}
