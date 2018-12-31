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
  getRandomArbitrary(enemyHP[0], enemyHP[1]);

/* Battle prep functions */

export function cleanBattleText(model) {
  const {cleanBattleText} = model;
  if (cleanBattleText) {
    return {...model, battleText: [], cleanBattleText: false};
  }
  return model;
}

/* The Player's Round */

export function startFight(model) {
  // Set that we're in battle and calculate the enemy's HP.
  const enemyWithHP = (!model.inBattle) ? {...model.enemy, hp: calculateEnemyHP(model.enemy.hp)} : model.enemy;
  const playerWithHP = (model.inBattle) ? {...model.player, hp: model.maxhp} : model.player;
  // TODO Determine who goes first, assume player for now
  const battleModel = {player: playerWithHP,
    enemy: enemyWithHP,
    battleText: model.battleText,
    inBattle: true};
  return playerRound(battleModel);
}

function playerRound(battleModel) {
  const {player, enemy} = battleModel;
  const damageToEnemy = playerDamage(player, enemy);
  const enemyAfterRound = {...enemy, hp: enemy.hp - damageToEnemy};
  const afterPlayerRoundModel = {...battleModel, enemy: enemyAfterRound};
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

/* The Enemy's Round */

export function startEnemyRound(model) {
  const {player, enemy, battleText, inBattle} = model;
  const battleModel = {player: model.player,
    enemy: enemy,
    battleText: model.battleText,
    inBattle};
  return enemyRound(battleModel);
}

function enemyRound(model) {
  const {player, enemy} = model;
  const damageToPlayer = enemyDamage(player, enemy);
  const playerAfterRound = {...player, hp: player.hp - damageToPlayer};
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
