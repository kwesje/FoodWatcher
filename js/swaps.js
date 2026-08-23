// Houdt bij of een dag ervoor kiest een ander gerecht te tonen dat elders die
// week (dezelfde fase) al gepland staat, per weeknummer + maaltijdtype +
// dagindex. Standaard (geen override) toont een dag gewoon zijn eigen gerecht.
// Omdat swaps alleen herverdelen WELKE dag een al-geplande maaltijd toont
// (niet welke gerechten die week gebruikt worden), blijft de wekelijkse
// boodschappenlijst gewoon kloppen zonder herberekening.

import { getItem, setItem } from "./storage.js";

const KEY = "mealSwaps";

function swapMapKey(weekNumber, mealType) {
  return `${weekNumber}-${mealType}`;
}

function getAll() {
  return getItem(KEY, {});
}

/** Geeft de dagindex terug waarvan dag `dayIndex` zijn `mealType` toont (zichzelf als er geen swap is). */
export function getSwapSourceIndex(weekNumber, mealType, dayIndex) {
  const all = getAll();
  const map = all[swapMapKey(weekNumber, mealType)];
  if (!map || !(dayIndex in map)) return dayIndex;
  return map[dayIndex];
}

/** Stelt in dat dag `dayIndex` het gerecht van `sourceDayIndex` toont (gelijk aan dayIndex = swap opheffen). */
export function setSwapSourceIndex(weekNumber, mealType, dayIndex, sourceDayIndex) {
  const all = getAll();
  const key = swapMapKey(weekNumber, mealType);
  const map = { ...(all[key] || {}) };

  if (sourceDayIndex === dayIndex) {
    delete map[dayIndex];
  } else {
    map[dayIndex] = sourceDayIndex;
  }

  all[key] = map;
  setItem(KEY, all);
}
