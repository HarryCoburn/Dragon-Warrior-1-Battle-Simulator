const getRandomArbitrary = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const coinFlip = () => Math.floor(Math.random() * 2) === 0;
const capitalize = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const lowDamage = (x, y) => (x - (y/2)) / 4;
const highDamage = (x, y) => (x - (y/2)) / 2;
const lowDamageHighDefense = 0;
const highDamageHighDefense = (x) => (x+4) / 6;
const criticalHitChance = 32;
const criticalDamageLow = (x) => x / 2;
const criticalDamageHigh = (x) => x;
const calculateEnemyHP = (enemyHP) =>
  (typeof enemyHP !== 'object') ? enemyHP :
  getRandomArbitrary(...enemyHP);

const hurtCost = 2;
const hurtmoreCost = 5;
const playerHurtRange = [5, 12];
const playerHurtmoreRange = [58, 65];
const resistLimit = 16;
const dodgeLimit = 64;
const resistCheck = (resistValue) =>
  (getRandomArbitrary(1, resistLimit) <= resistValue) ? true : false;

// Testing battle AI
const sumOfWeights = (enemyAI) => enemyAI.reduce(function(memo, entry) {
  return memo + entry.weight;
}, 0);

/**
 * [getAttack description]
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

/* Battle prep functions */

/**
 * [startBattle description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function startBattle(model) {
  // Clean the battle text
  const cleanModel = cleanBattleText(model);
  if (typeof cleanModel.enemy === 'object') {
    const preparedBattleModel = fightSetup(model);
    const updatedMsgs = [...preparedBattleModel.battleText, `You are fighting the ${preparedBattleModel.enemy.name}`];
    return {...preparedBattleModel, battleText: updatedMsgs};
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
 * [cleanBattleText description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function cleanBattleText(model) {
  const {cleanBattleText} = model;
  if (cleanBattleText) {
    return {...model, battleText: [], cleanBattleText: false};
  }
  return model;
}

/* The Player's Round */

/**
 * [startPlayerRound description]
 * @param  {[type]} model [description]
 * @param  {[type]} msg   [description]
 * @return {[type]}       [description]
 */
export function startPlayerRound(model, msg) {
  const {playerSleep} = model;
  const updatedText = [...model.battleText];
  if (playerSleep) {
    if (coinFlip()) {
      updatedText.push('You are still asleep!');
      return {...model, battleText: updatedText};
    } else {
      updatedText.push('You wake up!');
    }
  }
  const playerAwake = {...model, playerSleep: false};
  switch (msg.type) {
    case 'CAST_HEAL':
    case 'CAST_HEALMORE':
    case 'CAST_HURT':
    case 'CAST_HURTMORE':
    case 'CAST_SLEEP':
    case 'CAST_STOPSPELL': {
      return playerSpell(msg, playerAwake);
      break;
    }
    case 'FIGHT': {
      return playerFight(playerAwake);
    }
  }
}

/**
 * [playerFight description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function playerFight(model) {
  const {player, enemy} = model;
  const damageToEnemy = playerDamage(player, enemy);
  const enemyAfterRound = {...enemy, hp: enemy.hp - damageToEnemy};
  const afterPlayerRoundModel = {...model, enemy: enemyAfterRound};
  return playerBattleMessages(afterPlayerRoundModel, damageToEnemy);
}

/**
 * [playerDamage description]
 * @param  {[type]} player [description]
 * @param  {[type]} enemy  [description]
 * @return {[type]}        [description]
 */
function playerDamage(player, enemy) {
  const heroAttack = player.strength + player.weapon.mod;
  const enemyDefense = enemy.agility;
  if (getRandomArbitrary(1, criticalHitChance) === criticalHitChance) {
    const playerLow = criticalDamageLow(heroAttack);
    const playerHigh = criticalDamageHigh(heroAttack);
    const playerDamage = getRandomArbitrary(playerLow, playerHigh);
    return isPlayerDamageLow(playerDamage);
  } else {
    const playerLow = lowDamage(heroAttack, enemyDefense);
    const playerHigh = highDamage(heroAttack, enemyDefense);
    const playerDamage = getRandomArbitrary(playerLow, playerHigh);
    return isPlayerDamageLow(playerDamage);
  }
}

/**
 * [isPlayerDamageLow description]
 * @param  {[type]}  playerDamage [description]
 * @return {Boolean}              [description]
 */
function isPlayerDamageLow(playerDamage) {
  if (playerDamage < 1) {
    const zeroDamage = coinFlip();
    const finalPlayerDamage = (zeroDamage === true) ? 0 : 1;
    return finalPlayerDamage;
  }
  return playerDamage;
}

/**
 * [playerBattleMessages description]
 * @param  {[type]} model  [description]
 * @param  {[type]} damage [description]
 * @return {[type]}        [description]
 */
function playerBattleMessages(model, damage) {
  const {enemy, battleText} = model;
  battleText.push(
      `Player attacks! Player hits ${enemy.name} for ${damage} points of damage. `);
  if (enemy.hp <= 0) {
    battleText.push(
        `You have defeated the ${enemy.name}!`);
    return {...model, battleText: battleText, inBattle: false};
  }
  return {...model, battleText: battleText};
}

/**
 * [playerSpell description]
 * @param  {[type]} msg   [description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function playerSpell(msg, model) {
  console.log(msg);
  switch (msg.type) {
    case 'CAST_HEAL': {
      return playerHeal(model, false);
      break;
    }
    case 'CAST_HEALMORE': {
      return playerHeal(model, true);
      break;
    }
    case 'CAST_HURT': {
      return playerHurt(model, false);
      break;
    }
    case 'CAST_HURTMORE': {
      return playerHurt(model, true);
      break;
    }
    case 'CAST_SLEEP': {
      return playerSleep(model);
      break;
    }
    case 'CAST_STOPSPELL': {
      return playerStop(model);
      break;
    }
    default:
      console.log('Spell fell through switchblock!');
      return model;
  }
}

/**
 * [playerHeal description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHealmore [description]
 * @return {[type]}             [description]
 */
function playerHeal(model, isHealmore) {
  const healCost = 4;
  const healmoreCost = 10;
  const playerHealRange = [10, 17];
  const playerHealmoreRange = [85, 100];
  const {player} = model;
  const {mp, hp, maxhp} = player;
  const spellName = (isHealmore) ? 'Healmore' : 'Heal';
  if ((mp < healCost && !isHealmore) || (mp < healmoreCost && isHealmore)) {
    const updatedText = [...model.battleText, `Player tries to cast ${spellName}, but doesn't have enough MP!`];
    return {...model, battleText: updatedText};
  } else {
    const newMP = (isHealmore) ? mp - healmoreCost : mp - healCost;
    const healMax = maxhp - hp;
    const healAmt = (isHealmore) ?
    getRandomArbitrary(...playerHealmoreRange) :
    getRandomArbitrary(...playerHealRange);
    const finalHeal = (healMax < healAmt) ? healMax : healAmt;
    const newPlayerHP = hp + finalHeal;
    const updatedText = [...model.battleText];
    if (finalHeal === 0) {
      updatedText.push(`Player casts ${spellName}! But their hit points were already at maximum!`);
    } else {
      updatedText.push(`Player casts ${spellName}! Player is healed ${finalHeal} hit points`);
    }
    const updatedPlayer = {...model.player, hp: newPlayerHP, mp: newMP};
    return {...model, player: updatedPlayer, battleText: updatedText};
  }
}

/**
 * [playerHurt description]
 * @param  {[type]}  model      [description]
 * @param  {Boolean} isHurtmore [description]
 * @return {[type]}             [description]
 */
function playerHurt(model, isHurtmore) {
  const {enemy, player} = model;
  const {hp, hurtR} = enemy;
  const {mp} = player;
  const spellName = (isHurtmore) ? 'Hurtmore' : 'Hurt';
  if ((mp < hurtCost && !isHurtmore) || (mp < hurtmoreCost && isHurtmore)) {
    const updatedText = [...model.battleText, `Player tries to cast ${spellName}, but doesn't have enough MP!`];
    return {...model, battleText: updatedText};
  } else {
    const newMP = (isHurtmore) ? mp - hurtmoreCost : mp - hurtCost;
    const newPlayer = {...player, mp: newMP};
    const hurtDamage = (isHurtmore) ?
      getRandomArbitrary(...playerHurtmoreRange) :
      getRandomArbitrary(...playerHurtRange);
    const newHP = hp - hurtDamage;
    const updatedText = [...model.battleText];
    updatedText.push(`Player casts Hurt!`);
    const hurtResisted = resistCheck(hurtR);
    if (hurtResisted === true) {
      updatedText.push(`But the ${enemy.name} resisted!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
    updatedText.push(` ${capitalize(enemy.name)} is hurt by ${hurtDamage} hit points`);
    const battleState = (newHP <= 0) ? false : true;
    // Handle wins
    const newEnemy = {...enemy, hp: newHP};
    if (newHP <= 0) {
      updatedText.push(`You have defeated the ${capitalize(enemy.name)}`);
    }
    return {...model,
      enemy: newEnemy, player: newPlayer,
      battleText: updatedText, inBattle: battleState};
  }
}

/**
 * [playerSleep description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function playerSleep(model) {
  const {enemy, player, enemySleep} = model;
  const {mp} = player;
  const {sleepR} = enemy;
  const updatedText = [...model.battleText];
  const sleepCost = 2;
  if (mp < sleepCost) {
    updatedText.push(`Player tries to cast Sleep, but doesn't have enough MP!`);
    return {...model, battleText: updatedText};
  } else {
    const newMP = mp - sleepCost;
    const newPlayer = {...player, mp: newMP};
    updatedText.push(`Player casts Sleep!`);
    if (enemySleep) {
      updatedText.push(`But the ${enemy.name} is already asleep!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
    const sleepResisted = resistCheck(sleepR);
    if (sleepResisted === true) {
      updatedText.push(`But the ${enemy.name} resisted!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
    updatedText.push(` ${capitalize(enemy.name)} is now asleep!`);
    const enemySleep = model.enemySleep || 2;
    return {...model,
      player: newPlayer,
      battleText: updatedText, enemySleep: enemySleep};
  }
}

/**
 * [playerStop description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function playerStop(model) {
  const {enemy, player, enemyStop} = model;
  const {mp} = player;
  const {stopR} = enemy;
  const updatedText = [...model.battleText];
  const stopCost = 2;
  if (mp < stopCost) {
    updatedText.push(`Player tries to cast Stopspell, but doesn't have enough MP!`);
    return {...model, battleText: updatedText};
  } else {
    const newMP = mp - stopCost;
    const newPlayer = {...player, mp: newMP};
    updatedText.push(`Player casts Stopspell!`);
    if (enemyStop) {
      updatedText.push(`But the ${enemy.name}'s magic is already blocked!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
    const stopResisted = resistCheck(stopR);
    if (stopResisted === true) {
      updatedText.push(`But the ${enemy.name} resisted!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
    updatedText.push(` ${capitalize(enemy.name)}'s magic is now blocked!`);
    const enemyStopState = true;
    return {...model,
      player: newPlayer,
      battleText: updatedText, enemyStop: enemyStopState};
  }
}

/* The Enemy's Round */

/**
 * [startEnemyRound description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
export function startEnemyRound(model) {
  const wakeChance = 3;
  const {enemySleep} = model;
  const updatedText = [...model.battleText];
  if (enemySleep > 0) {
    if (enemySleep === 2) { // Free round
      updatedText.push(`The ${model.enemy.name} is asleep.`);
      return {...model, battleText: updatedText, enemySleep: 1};
    } else {
      const wokeUp = (getRandomArbitrary(1, wakeChance) === wakeChance);
      if (wokeUp) {
        updatedText.push(`The ${model.enemy.name} woke up!`);
        return enemyRound({...model, battleText: updatedText, enemySleep: 0});
      } else {
        updatedText.push(`The ${model.enemy.name} is still asleep...`);
        return {...model, battleText: updatedText};
      }
    }
  }
  return enemyRound(model);
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
  // console.log('Current player HP is: ' + player.hp);
  // console.log('Trying to Deal = ' + damageToPlayer);
  // console.log('Player HP should be' + (player.hp - damageToPlayer));
  const playerAfterRound = {...player, hp: player.hp - damageToPlayer};

  // console.log('Player HP = ' + playerAfterRound.hp);
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
    const enemyLow = lowDamageHighDefense;
    const enemyHigh = highDamageHighDefense(enemyAttack);
    return getRandomArbitrary(enemyLow, enemyHigh);
  } else {
    const enemyLow = lowDamage(enemyAttack, heroDefense);
    const enemyHigh = highDamage(enemyAttack, heroDefense);
    return getRandomArbitrary(enemyLow, enemyHigh);
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
      getRandomArbitrary(...eHurtmoreRangeLow) :
      getRandomArbitrary(...eHurtmoreRange) :
    (magicDefense) ?
    getRandomArbitrary(...eHurtRangeLow) :
    getRandomArbitrary(...eHurtRange);
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
    getRandomArbitrary(...eHealmoreRange) :
    getRandomArbitrary(...eHealRange);
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
