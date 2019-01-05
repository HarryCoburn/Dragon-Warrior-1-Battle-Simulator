const getRandomArbitrary = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const coinFlip = () => Math.floor(Math.random() * 2) === 0;
const capitalize = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const lowDamage = (x, y) => (x - (y/2)) / 4;
const highDamage = (x, y) => (x - (y/2)) / 2;
const lowDamageHighDefense = 0;
const highDamageHighDefense = (x) => (x+4) / 6;
const criticalDamageLow = (x) => x / 2;
const criticalDamageHigh = (x) => x;
const calculateEnemyHP = (enemyHP) =>
  (typeof enemyHP !== 'object') ? enemyHP :
  getRandomArbitrary(...enemyHP);
const isExcellent = getRandomArbitrary(1, 32) === 1;
const dodgeSuccess = (dodgeChance) => getRandomArbitrary(1, 64) <= dodgeChance;
const hurtCost = 2;
const hurtmoreCost = 5;
const playerHurtRange = [5, 12];
const playerHurtmoreRange = [58, 65];
const resistLimit = 16;
const resistCheck = (resistValue) =>
  (getRandomArbitrary(1, resistLimit) <= resistValue) ? true : false;
const runModifiers = [0.25, 0.375, 0.75, 1];

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
  const playerInit = player.agility * getRandomArbitrary(0, 255);
  const enemyInit = enemy.agility * getRandomArbitrary(0, 255) * 0.25;
  return enemyInit > playerInit;
}

/**
 * [cleanBattleText description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function cleanBattleText(model) {
  const {cleanBattleText} = model;
  if (cleanBattleText) {
    console.log('Should be cleaning battle text here...');
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
  const {playerSleep, sleepCount, enemy} = model;
  const dodged = dodgeSuccess(enemy.dodge);
  const updatedText = [...model.battleText];
  if (playerSleep) {
    if (coinFlip() && sleepCount > 0) {
      updatedText.push('You are still asleep!');
      const newCount = sleepCount - 1;
      return {...model, battleText: updatedText, sleepCount: newCount};
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
      return playerFight(playerAwake, dodged);
    }
    case 'USE_HERB': {
      return useHerb(playerAwake);
    }
    case 'RUN_AWAY': {
      return runAway(playerAwake);
    }
  }
}

/**
 * [useHerb description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function useHerb(model) {
  const herbRange = [23, 30];
  const updatedText = [...model.battleText];
  const {player} = model;
  const {hp, maxhp, herbCount} = player;
  const healMax = maxhp - hp;
  const healAmt = getRandomArbitrary(...herbRange);
  const finalHeal = (healMax < healAmt) ? healMax : healAmt;
  const newPlayerHP = hp + finalHeal;
  if (finalHeal === 0) {
    updatedText.push(`Player eats a healing herb. But their hit points were already at maximum!`);
  } else {
    updatedText.push(`Player eats a healing herb. Player is healed ${finalHeal} hit points`);
  }
  const newHerbCount = herbCount - 1;
  const updatedPlayer =
    {...model.player, hp: newPlayerHP, herbCount: newHerbCount};
  return {...model, player: updatedPlayer, battleText: updatedText};
}

/**
 * [runAway description]
 * @param  {[type]} model [description]
 * @return {[type]}       [description]
 */
function runAway(model) {
  const {player, enemy} = model;
  const pAgility = player.agility;
  const eAgility = enemy.agility;
  const pMod = getRandomArbitrary(0, 255);
  const eMod = getRandomArbitrary(0, 255);
  const eRunMod = runModifiers[enemy.run];
  const updatedText = [...model.battleText];
  updatedText.push(`You try to run away...`);
  const successfulRun = pAgility * pMod > eAgility * eMod * eRunMod;
  if (successfulRun || model.enemySleep === true) {
    updatedText.push(`You succeed in fleeing!`);
    return {...model, inBattle: false, battleText: updatedText};
  } else {
    updatedText.push(`...but the enemy blocks you from running away!`);
    return {...model, battleText: updatedText};
  }
}

/**
 * [playerFight description]
 * @param  {[type]} model [description]
 * @param  {[type]} dodged [description]
 * @return {[type]}       [description]
 */
export function playerFight(model, dodged) {
  const {player, enemy} = model;
  const critHit = isExcellent;
  const damageToEnemy = playerDamage(player, enemy, critHit, dodged);
  const enemyAfterRound = {...enemy, hp: enemy.hp - damageToEnemy};
  const afterPlayerRoundModel = {...model, enemy: enemyAfterRound};
  return playerBattleMessages(
      afterPlayerRoundModel, damageToEnemy, critHit, dodged);
}

/**
 * [playerDamage description]
 * @param  {[type]} player [description]
 * @param  {[type]} enemy  [description]
 * @param  {[type]} critHit  [description]
 * @param  {[type]} dodged  [description]
 * @return {[type]}        [description]
 */
function playerDamage(player, enemy, critHit, dodged) {
  if (dodged) return 0;
  const heroAttack = player.strength + player.weapon.mod;
  const enemyDefense = enemy.agility;
  if (critHit) {
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
 * @param  {[type]} critHit [description]
 * @param  {[type]} dodged [description]
 * @return {[type]}        [description]
 */
function playerBattleMessages(model, damage, critHit, dodged) {
  const {enemy, battleText} = model;
  if (critHit && !enemy.voidCrit) {
    battleText.push(
        `Player attacks with an excellent attack!!`);
  } else {
    battleText.push(
        `Player attacks!`);
  }
  if (dodged) {
    battleText.push(`But the ${enemy.name} dodged your attack!`);
    return {...model, battleText: battleText};
  }
  battleText.push(`Player hits ${enemy.name} for ${damage} points of damage.`);
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
  const updatedText = [...model.battleText];
  const {player, playerStop} = model;
  const {mp, hp, maxhp} = player;
  const spellName = (isHealmore) ? 'Healmore' : 'Heal';
  if ((mp < healCost && !isHealmore) || (mp < healmoreCost && isHealmore)) {
    const updatedText = [...model.battleText, `Player tries to cast ${spellName}, but doesn't have enough MP!`];
    return {...model, battleText: updatedText};
  } else {
    const newMP = (isHealmore) ? mp - healmoreCost : mp - healCost;
    if (playerStop) {
      updatedText.push(`Player casts ${spellName}! But their magic has been sealed!`);
      const updatedPlayer = {...model.player, mp: newMP};
      return {...model, player: updatedPlayer, battleText: updatedText};
    }
    const healMax = maxhp - hp;
    const healAmt = (isHealmore) ?
    getRandomArbitrary(...playerHealmoreRange) :
    getRandomArbitrary(...playerHealRange);
    const finalHeal = (healMax < healAmt) ? healMax : healAmt;
    const newPlayerHP = hp + finalHeal;
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
  const {enemy, player, playerStop} = model;
  const {hp, hurtR} = enemy;
  const {mp} = player;
  const spellName = (isHurtmore) ? 'Hurtmore' : 'Hurt';
  if ((mp < hurtCost && !isHurtmore) || (mp < hurtmoreCost && isHurtmore)) {
    const updatedText = [...model.battleText, `Player tries to cast ${spellName}, but doesn't have enough MP!`];
    return {...model, battleText: updatedText};
  } else {
    const newMP = (isHurtmore) ? mp - hurtmoreCost : mp - hurtCost;
    const newPlayer = {...player, mp: newMP};
    if (playerStop) {
      updatedText.push(`Player casts ${spellName}! But their magic has been sealed!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
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
  const {enemy, player, playerStop} = model;
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
    if (playerStop) {
      updatedText.push(`Player casts ${spellName}! But their magic has been sealed!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
    updatedText.push(`Player casts Sleep!`);
    if (model.enemySleep) {
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
  const {enemy, player, enemyStop, playerStop} = model;
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
    if (playerStop) {
      updatedText.push(`Player casts ${spellName}! But their magic has been sealed!`);
      return {...model, player: newPlayer, battleText: updatedText};
    }
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
      const wokeUp = (getRandomArbitrary(1, wakeChance) === wakeChance);
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
    const enemyRun = getRandomArbitrary(1, 4) === 4;
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
        getRandomArbitrary(...eStrongfireRangeLow) :
        getRandomArbitrary(...eStrongfireRange) :
      (fireDefense) ?
      getRandomArbitrary(...eFireRangeLow) :
      getRandomArbitrary(...eFireRange);
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
