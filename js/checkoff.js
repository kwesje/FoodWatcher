// Houdt bij welke maaltijden per kalenderdag al zijn afgevinkt.
// Opslag: { "YYYY-MM-DD": ["ontbijt", "snack", ...] }

import { getItem, setItem } from "./storage.js";

const CHECKED_KEY = "checkedMeals";

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getAllChecked() {
  return getItem(CHECKED_KEY, {});
}

export function isMealChecked(key, mealType) {
  const all = getAllChecked();
  return Boolean(all[key] && all[key].includes(mealType));
}

export function toggleMealChecked(key, mealType) {
  const all = getAllChecked();
  const forDay = new Set(all[key] || []);

  if (forDay.has(mealType)) {
    forDay.delete(mealType);
  } else {
    forDay.add(mealType);
  }

  all[key] = [...forDay];
  setItem(CHECKED_KEY, all);
  return forDay.has(mealType);
}
