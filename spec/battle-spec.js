import * as R from "ramda";
import startBattle from "../src/Battle";

describe("Battle Setup Test", () => {
  let model;
  beforeEach(() => {
    model = {
      battleText: [],
      enemy: {
        name: "Slime",
        strength: 5,
        agility: 3,
        hp: 3
      },
      cleanBattleText: R.F,
      inBattle: R.F,
      initiative: R.F,
      player: {
        name: "Rollo",
        strength: 4,
        agility: 4,
        hp: 15,
        maxhp: 15
      }
    };
  });

  it("should return a prepared battle model with numeric HP", () => {
    model = startBattle(model);

    expect(model.battleText).toEqual([`You are fighting the Slime`]);
    expect(model.player.hp).toEqual(model.player.maxhp);
    expect(model.enemy.hp).toEqual(model.enemy.maxhp);
    expect(model.inBattle).toEqual(true);
    expect(model.initiative).toBeDefined();
  });

  it("should return a prepared battle model with arrayed HP", () => {
    model.enemy = {
      name: "Slime",
      strength: 5,
      agility: 3,
      hp: [5, 6]
    };
    model = startBattle(model);

    expect(model.battleText).toEqual([`You are fighting the Slime`]);
    expect(model.player.hp).toEqual(model.player.maxhp);
    expect(model.enemy.hp).toEqual(model.enemy.maxhp);
    expect(model.inBattle).toEqual(true);
    expect(model.initiative).toBeDefined();
  });

  it("should complain when no enemy has been selected", () => {
    model.enemy = "";
    model = startBattle(model);

    expect(model.battleText).toEqual([`Please choose an enemy!`]);
    expect(model.cleanBattleText).toEqual(true);
    expect(model.initiative).toEqual(false);
  });

  it("should clear the text if there is text inside model.battleText", () => {
    model.cleanBattleText = R.T;
    model.battleText = [`You shouldn't see this`];
    model = startBattle(model);

    expect(model.battleText).toEqual([`You are fighting the Slime`]);
    expect(model.cleanBattleText).toEqual(R.F);
  });
});
