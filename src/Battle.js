const getRandomArbitrary = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);
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
const healCost = 4;
const healmoreCost = 10;
const playerHealRange = [10, 17];
const playerHealmoreRange = [85, 100];
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
  const enemyWithHP = (!model.inBattle) ? {...model.enemy, hp: calculateEnemyHP(model.enemy.hp)} : model.enemy;
  const playerWithHP = (!model.inBattle) ? {...model.player, hp: model.player.maxhp} : model.player;
  // Set that we're fighting
  return {...model, player: playerWithHP, enemy: enemyWithHP, inBattle: true};
}

function cleanBattleText(model) {
  const {cleanBattleText} = model;
  if (cleanBattleText) {
    return {...model, battleText: [], cleanBattleText: false};
  }
  return model;
}

/* The Player's Round */

export function playerFight(model) {
  const {player, enemy} = model;
  const damageToEnemy = playerDamage(player, enemy);
  const enemyAfterRound = {...enemy, hp: enemy.hp - damageToEnemy};
  const afterPlayerRoundModel = {...model, enemy: enemyAfterRound};
  return playerBattleMessages(afterPlayerRoundModel, damageToEnemy);
}

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

function isPlayerDamageLow(playerDamage) {
  if (playerDamage < 1) {
    const zeroDamage = coinFlip();
    const finalPlayerDamage = (zeroDamage === true) ? 0 : 1;
    return finalPlayerDamage;
  }
  return playerDamage;
}

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

/* The Enemy's Round */

export function startEnemyRound(model) {
  return enemyRound(model);
}

function enemyRound(model) {
  const {enemy} = model;
  const chosenAttack = enemy.pattern.find(getAttack(sumOfWeights(enemy.pattern))).id;
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
  }
}

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

function enemyDamage(player, enemy) {
  // Basic enemy attack calculations
  const enemyAttack = enemy.strength;
  const heroDefense = Math.floor((player.agility + player.armor.mod + player.shield.mod)/2);
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

function enemyHurt(model, isHurtmore) {
  const eHurtRange = [3,10];
  const eHurtmoreRange = [30, 45];
  const spellName = (isHurtmore) ? 'Hurtmore' : 'Hurt';
  const {enemy, player} = model;
  const {hp} = player;
    const hurtDamage = (isHurtmore) ?
      getRandomArbitrary(...eHurtmoreRange) :
      getRandomArbitrary(...eHurtRange);
    const newHP = hp - hurtDamage;
    const updatedText = [...model.battleText];
    updatedText.push(`${capitalize(enemy.name)} casts ${spellName}!`);
    updatedText.push(` Player is hurt by ${hurtDamage} hit points.`);
    const battleState = (newHP <= 0) ? false : true;
    // Handle wins
    const newEnemy = {...player, hp: newHP};
    if (newHP <= 0) {
      updatedText.push(`You have been defeated by the ${capitalize(enemy.name)}.`);
    }
    return {...model,
      player: newPlayer,
      battleText: updatedText, inBattle: battleState};
  }
