// Koppelt de cyclus-logica (cycle.js) aan de menudata (data.js): bepaalt welke
// menuweek en -dag bij een gegeven kalenderdatum horen.

import { WEEKS } from "./data.js";
import { getCycleDay, getWeekNumber, getDayIndexInWeek } from "./cycle.js";

/**
 * Geeft de volledige menu-info voor `date` terug: { cycleDay, weekNumber, dayIndex, week, day }.
 * Geeft null terug als er nog geen cyclus-startdatum is ingesteld.
 */
export function getMenuInfoForDate(date = new Date()) {
  const cycleDay = getCycleDay(date);
  if (cycleDay === null) return null;

  const weekNumber = getWeekNumber(cycleDay);
  const dayIndex = getDayIndexInWeek(cycleDay);
  const week = WEEKS[weekNumber - 1];
  const day = week.days[dayIndex];

  return { cycleDay, weekNumber, dayIndex, week, day };
}
