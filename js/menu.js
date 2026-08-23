// Koppelt de cyclus-logica (cycle.js) aan de menudata (data.js): bepaalt welke
// menuweek en -dag bij een gegeven kalenderdatum horen.

import { WEEKS } from "./data.js";
import { getCycleDay, getWeekNumber, getDayIndexInWeek } from "./cycle.js";
import { getSwapSourceIndex } from "./swaps.js";

const SWAPPABLE_TYPES = ["ontbijt", "lunch", "diner"];

function resolveEffectiveDay(weekNumber, week, dayIndex) {
  const day = week.days[dayIndex];
  const effective = { ...day };

  SWAPPABLE_TYPES.forEach((type) => {
    const sourceIndex = getSwapSourceIndex(weekNumber, type, dayIndex);
    effective[type] = week.days[sourceIndex][type];
  });

  return effective;
}

/**
 * Geeft de volledige menu-info voor `date` terug: { cycleDay, weekNumber, dayIndex, week, day }.
 * `day` houdt rekening met eventuele omwisselingen (zie swaps.js).
 * Geeft null terug als er nog geen cyclus-startdatum is ingesteld.
 */
export function getMenuInfoForDate(date = new Date()) {
  const cycleDay = getCycleDay(date);
  if (cycleDay === null) return null;

  const weekNumber = getWeekNumber(cycleDay);
  const dayIndex = getDayIndexInWeek(cycleDay);
  const week = WEEKS[weekNumber - 1];
  const day = resolveEffectiveDay(weekNumber, week, dayIndex);

  return { cycleDay, weekNumber, dayIndex, week, day };
}
