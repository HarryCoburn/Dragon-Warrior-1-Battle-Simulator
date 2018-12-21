const getRandomArbitrary = (min, max) =>
  Math.random() * (max - min) + min;
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
  Math.floor(getRandomArbitrary(enemyHP[0], enemyHP[1]));


/**
 * [fight description]
 * @param  {[type]} player [description]
 * @param  {[type]} enemy  [description]
 * @return {[type]}        [description]
 */
export function fight(player, enemy) {
  console.log('This is the enemy');
  console.log(enemy);
  // Get the damage ranges
  const ranges = damageRanges(player, enemy);
  const damage = calculateDamage(ranges);
  const {finalPlayerDamage, finalEnemyDamage} = damage;
  const enemyHP = calculateEnemyHP(enemy.hp);
  const playerHP = player.hp;
  const enemyAfterRound = {...enemy, hp: enemyHP - finalPlayerDamage};
  const playerAfterRound = {...player, hp: playerHP - finalEnemyDamage};
  const playerBattleText = [];
  const enemyBattleText = [];
  playerBattleText.push(
      `Player attacks! Player hits ${enemy.name} for ${finalPlayerDamage} points of damage. `);
  if (enemyAfterRound.hp <= 0) {
    playerBattleText.push(
        `You have defeated the ${enemy.name}!`);
    return {playerAfterRound,
      enemyAfterRound,
      playerBattleText,
      enemyBattleText,
      battleState: false};
  }
  enemyBattleText.push(
      `${capitalize(enemy.name)} attacks! ${capitalize(enemy.name)} hits player for ${finalEnemyDamage} points of damage`);
  if (playerAfterRound.hp <= 0) {
    enemyBattleText.push(
        `You have been defeated by the ${enemy.name}!`);
    return {playerAfterRound,
      enemyAfterRound,
      playerBattleText,
      enemyBattleText,
      battleState: false};
  }
  return {playerAfterRound,
    enemyAfterRound,
    playerBattleText,
    enemyBattleText,
    battleState: true};
}

/**
 * [damageRanges Computes the possible range of damage for the round]
  @param  {[object]} player [Player Object]
  @param  {[object]} enemy  [Enemy Object]
  @return {[object]}        [Array of damage ranges]
 */
function damageRanges(player, enemy) {
  // Basic enemy attack calculations
  const enemyAttack = enemy.strength;
  const heroDefense = Math.floor(player.agility/2);
  const heroHighDefense = heroDefense >= enemyAttack;
  const values = {};
  // Enemy attack range calculation
  if (heroHighDefense) {
    values.enemyLow = lowDamageHighDefense;
    values.enemyHigh = highDamageHighDefense(enemyAttack);
  } else {
    values.enemyLow = lowDamage(enemyAttack, heroDefense);
    values.enemyHigh = highDamage(enemyAttack, heroDefense);
  }
  // Player attack range calculation.
  const heroAttack = player.strength;
  const enemyDefense = enemy.agility;
  if (getRandomArbitrary(1, criticalHitChance) === criticalHitChance) {
    values.playerLow = criticalDamageLow(heroAttack);
    values.playerHigh = criticalDamageHigh(heroAttack);
  } else {
    values.playerLow = lowDamage(heroAttack, enemyDefense);
    values.playerHigh = highDamage(heroAttack, enemyDefense);
    return values;
  }
}

/**
 * [calculateDamage description]
 * @param  {[type]} ranges [description]
 * @return {[type]}        [description]
 */
function calculateDamage(ranges) {
  const {enemyLow, enemyHigh, playerLow, playerHigh}= ranges;
  const playerDamage = Math.floor(getRandomArbitrary(playerLow, playerHigh));
  const enemyDamage = Math.floor(getRandomArbitrary(enemyLow, enemyHigh));
  const values = {
    finalPlayerDamage: isPlayerDamageLow(playerDamage),
    finalEnemyDamage: enemyDamage,
  };
  return values;
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
