// Houdt bij welke boodschappenlijst-items zijn afgevinkt. De lijst hoort bij
// een specifieke menuweek van een specifieke cyclus: als er een nieuwe cyclus
// wordt gestart, begint de lijst weer leeg (nieuwe boodschappenronde).

import { getItem, setItem } from "./storage.js";
import { getCycleStart } from "./cycle.js";

const KEY = "shoppingChecked";

function listKey(weekNumber) {
  const start = getCycleStart();
  const startStr = start ? start.toISOString().slice(0, 10) : "none";
  return `${startStr}_w${weekNumber}`;
}

function getAll() {
  return getItem(KEY, {});
}

export function isItemChecked(weekNumber, id) {
  const all = getAll();
  const key = listKey(weekNumber);
  return Boolean(all[key] && all[key].includes(id));
}

export function toggleItemChecked(weekNumber, id) {
  const all = getAll();
  const key = listKey(weekNumber);
  const checked = new Set(all[key] || []);

  if (checked.has(id)) {
    checked.delete(id);
  } else {
    checked.add(id);
  }

  all[key] = [...checked];
  setItem(KEY, all);
  return checked.has(id);
}
