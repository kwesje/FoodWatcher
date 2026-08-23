// Berekent de exacte boodschappenlijst voor een menuweek uit de receptdata:
// voor elk uniek recept dat die week wordt gebruikt, tel je hoe vaak het als
// maaltijd voorkomt en deel je door het aantal porties dat het recept oplevert
// (naar boven afgerond) om te weten hoeveel keer je het recept moet koken —
// dat aantal batches bepaalt hoeveel van elk ingrediënt nodig is.
// Ongekwantificeerde kruiden/aromaten komen er als aparte, ongewogen checklist bij.

import { RECIPES } from "./data.js";
import { INGREDIENT_CATALOG } from "./ingredients.js";

const MEAL_TYPES = ["ontbijt", "lunch", "diner"];

function countRecipeOccurrences(week) {
  const counts = new Map();
  week.days.forEach((day) => {
    MEAL_TYPES.forEach((type) => {
      const slug = day[type];
      if (!slug) return;
      counts.set(slug, (counts.get(slug) || 0) + 1);
    });
  });
  return counts;
}

/**
 * Geeft { quantified: [{ key, label, category, qty, unit }], seasoning: [{ key, label, category }] }
 * voor de opgegeven menuweek, gesorteerd per categorie.
 */
export function getWeeklyShoppingList(week) {
  const occurrences = countRecipeOccurrences(week);
  const quantifiedTotals = new Map(); // key -> { qty, unit }
  const seasoningKeys = new Set();

  occurrences.forEach((count, slug) => {
    const recipe = RECIPES[slug];
    const batches = Math.ceil(count / recipe.servings);

    recipe.ingredients.forEach((ingredient) => {
      if (ingredient.qty && ingredient.unit) {
        const existing = quantifiedTotals.get(ingredient.key);
        const added = ingredient.qty * batches;
        if (existing) {
          existing.qty += added;
        } else {
          quantifiedTotals.set(ingredient.key, { qty: added, unit: ingredient.unit });
        }
      } else {
        const keys = ingredient.keys || [ingredient.key];
        keys.forEach((key) => seasoningKeys.add(key));
      }
    });
  });

  const quantified = [...quantifiedTotals.entries()].map(([key, { qty, unit }]) => {
    const catalog = INGREDIENT_CATALOG[key];
    return {
      key,
      label: catalog.label,
      category: catalog.category,
      qty: Math.round(qty),
      unit,
    };
  });

  const seasoning = [...seasoningKeys].map((key) => {
    const catalog = INGREDIENT_CATALOG[key];
    return { key, label: catalog.label, category: catalog.category };
  });

  quantified.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
  seasoning.sort((a, b) => a.label.localeCompare(b.label));

  return { quantified, seasoning };
}
