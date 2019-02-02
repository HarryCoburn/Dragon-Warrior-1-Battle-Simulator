import { T, F } from "ramda";
import startBattle from "../src/Battle";

const model = {
  battleText: [],
  enemy: {
    name: "Slime",
    strength: 5,
    agility: 3,
    hp: 3
  },
  cleanBattleText: F,
  inBattle: F,
  initiative: F,
  player: {
    name: "Rollo",
    strength: 4,
    agility: 4,
    hp: 15,
    maxhp: 15
  }
};

describe("Battle.js Tests", () => {
  const testModel = startBattle(model);
  test("Return a normal battle model", () => {
    expect(testModel.battleText).toEqual([`You are fighting the Slime`]);
    expect(testModel.player.hp).toEqual(testModel.player.maxhp);
    expect(testModel.enemy.hp).toEqual(testModel.enemy.maxhp);
    expect(testModel.inBattle).toEqual(true);
    expect(testModel.hasOwnProperty("initiative")).toBe(true);
  });

  test("Check arrayed enemy", () => {
    const arrayModel = {
      ...model,
      enemy: {
        name: "Slime",
        strength: 5,
        agility: 3,
        hp: [5, 6]
      }
    };
    const testModel2 = startBattle(arrayModel);

    expect(testModel2.enemy.hp).toEqual(testModel2.enemy.maxhp);
  });

  test("Check empty enemy", () => {
    const emptyModel = { ...model, enemy: "" };
    const testModel3 = startBattle(emptyModel);

    expect(testModel3.battleText).toEqual([`Please choose an enemy!`]);
    expect(testModel3.cleanBattleText).toEqual(true);
    expect(testModel3.initiative).toEqual(false);
  });

  test("Clearing text", () => {
    const textModel = {
      ...model,
      cleanBattleText: T,
      battleText: [`You shouldn't see this`]
    };
    const testModel4 = startBattle(textModel);

    expect(testModel4.battleText).toEqual([`You are fighting the Slime`]);
    expect(testModel4.cleanBattleText).toEqual(F);
  });
});
