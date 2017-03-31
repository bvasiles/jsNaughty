define(['engine', 'dnd4model'], function(engine, dnd4model) {
  "use strict";
  
  var abilitymod = dnd4model.abilitymod;
  
  var types = {};
  var byID = {};
  var te;
  
  var Ability_Score = types['Ability Score'] || (types['Ability Score'] = {});
  te = Ability_Score["Charisma"] = new engine.RulesElement({
    name: "Charisma",
    type: "Ability Score",
    id: "ID_FMP_ABILITY_SCORE_6",
    source: "Core",
    categories: ["Charisma", "ID_FMP_ABILITY_SCORE_6"]
  });
  byID[te.id] = te;
  
  te = Ability_Score["Constitution"] = new engine.RulesElement({
    name: "Constitution",
    type: "Ability Score",
    id: "ID_FMP_ABILITY_SCORE_2",
    source: "Core",
    categories: ["Constitution", "ID_FMP_ABILITY_SCORE_2"]
  });
  byID[te.id] = te;
  
  te = Ability_Score["Dexterity"] = new engine.RulesElement({
    name: "Dexterity",
    type: "Ability Score",
    id: "ID_FMP_ABILITY_SCORE_3",
    source: "Core",
    categories: ["Dexterity", "ID_FMP_ABILITY_SCORE_3"]
  });
  byID[te.id] = te;
  
  te = Ability_Score["Intelligence"] = new engine.RulesElement({
    name: "Intelligence",
    type: "Ability Score",
    id: "ID_FMP_ABILITY_SCORE_4",
    source: "Core",
    categories: ["Intelligence", "ID_FMP_ABILITY_SCORE_4"]
  });
  byID[te.id] = te;
  
  te = Ability_Score["Strength"] = new engine.RulesElement({
    name: "Strength",
    type: "Ability Score",
    id: "ID_FMP_ABILITY_SCORE_1",
    source: "Core",
    categories: ["Strength", "ID_FMP_ABILITY_SCORE_1"]
  });
  byID[te.id] = te;
  
  te = Ability_Score["Wisdom"] = new engine.RulesElement({
    name: "Wisdom",
    type: "Ability Score",
    id: "ID_FMP_ABILITY_SCORE_5",
    source: "Core",
    categories: ["Wisdom", "ID_FMP_ABILITY_SCORE_5"]
  });
  byID[te.id] = te;
  
  
  return {
    types: types,
    id: byID
  };
});
