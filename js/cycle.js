// Cyclus-logica: bepaalt op basis van een handmatig ingestelde startdatum
// (dag 1 van de menstruatie) welke cyclusdag (1-28) "vandaag" is.
// Het menu is een vaste 4-wekencyclus van 28 dagen die na dag 28 opnieuw begint,
// totdat de gebruiker een nieuwe startdatum instelt.

import { getItem, setItem } from "./storage.js";

export const CYCLE_LENGTH = 28;
const START_KEY = "cycleStart";

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Geeft de ingestelde cyclus-startdatum terug (dag 1), of null als die nog niet is ingesteld. */
export function getCycleStart() {
  const iso = getItem(START_KEY);
  return iso ? toDateOnly(new Date(iso)) : null;
}

/** Slaat vandaag (of een gegeven datum) op als dag 1 van een nieuwe cyclus. */
export function setCycleStart(date = new Date()) {
  const dateOnly = toDateOnly(date);
  setItem(START_KEY, dateOnly.toISOString());
  return dateOnly;
}

/**
 * Berekent de cyclusdag (1 t/m 28) voor `today` op basis van de opgeslagen startdatum.
 * Geeft null terug als er nog geen startdatum is ingesteld.
 */
export function getCycleDay(today = new Date(), start = getCycleStart()) {
  if (!start) return null;
  const todayOnly = toDateOnly(today);
  const diffDays = Math.floor((todayOnly - start) / 86400000);
  const wrapped = ((diffDays % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH;
  return wrapped + 1;
}

/** Weeknummer (1-4) van het menu voor een gegeven cyclusdag (1-28). */
export function getWeekNumber(cycleDay) {
  return Math.ceil(cycleDay / 7);
}

/** Index (0-6) van de dag binnen de menuweek voor een gegeven cyclusdag (1-28). */
export function getDayIndexInWeek(cycleDay) {
  return (cycleDay - 1) % 7;
}
