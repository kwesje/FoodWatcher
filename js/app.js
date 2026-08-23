import { RECIPES } from "./data.js";
import { getWeeklyShoppingList } from "./weeklyShopping.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Offline-ondersteuning is een extra; de app blijft werken zonder.
    });
  });
}
import { getCycleStart, setCycleStart, CYCLE_LENGTH } from "./cycle.js";
import { getMenuInfoForDate } from "./menu.js";
import { dateKey, isMealChecked, toggleMealChecked } from "./checkoff.js";
import { getSwapSourceIndex, setSwapSourceIndex } from "./swaps.js";
import { isItemChecked, toggleItemChecked } from "./shopping.js";

const app = document.getElementById("app");
const cycleStatus = document.getElementById("cycle-status");

let dayOffset = 0;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const MEAL_LABELS = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  snack: "Snack",
  diner: "Diner",
};

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDateDutch(date) {
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function formatDayLabel(date, offset) {
  if (offset === 0) return "Vandaag";
  if (offset === -1) return "Gisteren";
  if (offset === 1) return "Morgen";
  return date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function submitLabelForValue(value) {
  if (value === todayISO()) return "Mijn menstruatie is vandaag gestart";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "Startdatum instellen";
  return `Mijn menstruatie is gestart op ${formatDateDutch(new Date(year, month - 1, day))}`;
}

function renderCycleSetupForm(isReset) {
  const wrapper = el("section", { class: "cycle-setup" }, [
    el("p", {}, isReset
      ? "Wanneer is je huidige cyclus begonnen?"
      : "Stel eenmalig in wanneer je laatste menstruatie is begonnen, dan berekent de app automatisch in welke week en fase je zit."),
  ]);

  const form = el("form");
  const dateInput = el("input", { type: "date", id: "cycle-start-input", value: todayISO() });
  const submit = el("button", { type: "submit" }, submitLabelForValue(dateInput.value));
  form.appendChild(dateInput);
  form.appendChild(submit);

  dateInput.addEventListener("input", () => {
    submit.textContent = submitLabelForValue(dateInput.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const [year, month, day] = dateInput.value.split("-").map(Number);
    if (!year || !month || !day) return;
    setCycleStart(new Date(year, month - 1, day));
    app.innerHTML = "";
    renderToday();
  });

  wrapper.appendChild(form);
  return wrapper;
}

function renderMealBody(type, meal) {
  if (type === "snack") {
    return el("div", {}, [
      el("div", { class: "meal-type" }, MEAL_LABELS[type]),
      el("div", { class: "meal-name" }, meal),
    ]);
  }

  if (meal === null) {
    return el("div", {}, [
      el("div", { class: "meal-type" }, MEAL_LABELS[type]),
      el("div", { class: "meal-name" }, "Leftovers / vrije keuze"),
      el("div", { class: "meal-macros" }, "Flexibel: restjes, uit eten of iets uit de koelkast."),
    ]);
  }

  const recipe = RECIPES[meal];
  return el("a", { href: `#/recipe/${meal}` }, [
    el("div", { class: "meal-type" }, MEAL_LABELS[type]),
    el("div", { class: "meal-name" }, recipe.name),
    el("div", { class: "meal-macros" }, `±${recipe.kcal} kcal | ±${recipe.protein} g eiwit`),
  ]);
}

function getSwapOptions(week, type) {
  const seen = new Map(); // optionKey (slug or "__leftovers__") -> eerste dagindex
  week.days.forEach((day, idx) => {
    const value = day[type];
    const optionKey = value === null ? "__leftovers__" : value;
    if (!seen.has(optionKey)) seen.set(optionKey, idx);
  });
  return seen;
}

function renderSwapPicker(weekNumber, week, dayIndex, type) {
  const options = getSwapOptions(week, type);
  if (options.size < 2) return null;

  const currentSource = getSwapSourceIndex(weekNumber, type, dayIndex);

  const select = el("select", { class: "swap-select", "aria-label": `${MEAL_LABELS[type]} wisselen` });
  options.forEach((optionDayIndex, optionKey) => {
    const label = optionKey === "__leftovers__" ? "Leftovers / vrije keuze" : RECIPES[optionKey].name;
    const opt = el("option", { value: String(optionDayIndex) }, label);
    if (optionDayIndex === currentSource) opt.setAttribute("selected", "selected");
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    setSwapSourceIndex(weekNumber, type, dayIndex, Number(select.value));
    app.innerHTML = "";
    renderToday();
  });

  return el("div", { class: "swap-row" }, [el("span", { class: "swap-label" }, "Wissel: "), select]);
}

function renderMealCard(type, meal, key, swapPicker) {
  const checked = isMealChecked(key, type);

  const card = el("div", { class: "meal-card" + (checked ? " is-checked" : "") });
  const row = el("div", { class: "meal-card-row" });

  const checkBtn = el(
    "button",
    {
      type: "button",
      class: "meal-check" + (checked ? " is-checked" : ""),
      "aria-label": `${MEAL_LABELS[type]} afvinken`,
    },
    checked ? "✓" : ""
  );

  checkBtn.addEventListener("click", () => {
    const nowChecked = toggleMealChecked(key, type);
    card.classList.toggle("is-checked", nowChecked);
    checkBtn.classList.toggle("is-checked", nowChecked);
    checkBtn.textContent = nowChecked ? "✓" : "";
  });

  const body = el("div", { class: "meal-body" }, renderMealBody(type, meal));

  row.appendChild(checkBtn);
  row.appendChild(body);
  card.appendChild(row);
  if (swapPicker) card.appendChild(swapPicker);
  return card;
}

function renderRecipeView(slug) {
  const recipe = RECIPES[slug];

  if (!recipe) {
    return el("div", { class: "empty-state" }, [
      el("p", {}, "Recept niet gevonden."),
      el("a", { class: "back-link", href: "#/" }, "← Terug naar vandaag"),
    ]);
  }

  const container = el("div", { class: "recipe-view" });

  container.appendChild(el("a", { class: "back-link", href: "#/" }, "← Terug naar vandaag"));
  container.appendChild(el("h2", { class: "recipe-title" }, recipe.name));
  container.appendChild(
    el("p", { class: "recipe-meta" },
      `Voor: ${recipe.servings} ${recipe.servings === 1 ? "persoon" : "personen"} · ±${recipe.kcal} kcal | ±${recipe.protein} g eiwit per portie`)
  );

  container.appendChild(el("h3", {}, "Ingrediënten"));
  const ingredientsList = el("ul", { class: "ingredient-list" });
  recipe.ingredients.forEach((ingredient) => ingredientsList.appendChild(el("li", {}, ingredient.display)));
  container.appendChild(ingredientsList);

  container.appendChild(el("h3", {}, "Bereiding"));
  const stepsList = el("ol", { class: "step-list" });
  recipe.steps.forEach((step) => stepsList.appendChild(el("li", {}, step)));
  container.appendChild(stepsList);

  container.appendChild(el("h3", {}, "Bewaren/mealprep"));
  container.appendChild(el("p", { class: "recipe-storage" }, recipe.storage));

  return container;
}

function renderDayView(info, viewedDate) {
  cycleStatus.textContent = `${info.week.phase} · Week ${info.weekNumber} · Dag ${info.cycleDay}/${CYCLE_LENGTH}`;

  const container = el("div");

  const dayLabel = formatDayLabel(viewedDate, dayOffset);
  const rangeText =
    dayOffset === 0
      ? `${info.week.cyclusRange} · vandaag is cyclusdag ${info.cycleDay}`
      : `${info.week.cyclusRange} · cyclusdag ${info.cycleDay}`;

  const labelWrap = el("div", { class: "day-nav-label" }, [dayLabel]);
  if (dayOffset !== 0) {
    labelWrap.appendChild(el("button", { class: "day-nav-today", type: "button", id: "day-today" }, "vandaag"));
  }

  const dayNav = el("div", { class: "day-nav" }, [
    el("button", { class: "day-nav-btn", type: "button", id: "day-prev", "aria-label": "Vorige dag" }, "←"),
    labelWrap,
    el("button", { class: "day-nav-btn", type: "button", id: "day-next", "aria-label": "Volgende dag" }, "→"),
  ]);
  container.appendChild(dayNav);

  container.appendChild(
    el("div", { class: "day-header" }, [
      el("div", { class: "phase" }, info.week.phase),
      el("div", { class: "range" }, rangeText),
    ])
  );

  const key = dateKey(viewedDate);
  const mealList = el("div", { class: "meal-list" });
  mealList.appendChild(
    renderMealCard("ontbijt", info.day.ontbijt, key, renderSwapPicker(info.weekNumber, info.week, info.dayIndex, "ontbijt"))
  );
  mealList.appendChild(
    renderMealCard("lunch", info.day.lunch, key, renderSwapPicker(info.weekNumber, info.week, info.dayIndex, "lunch"))
  );
  mealList.appendChild(renderMealCard("snack", info.day.snack, key, null));
  mealList.appendChild(
    renderMealCard("diner", info.day.diner, key, renderSwapPicker(info.weekNumber, info.week, info.dayIndex, "diner"))
  );
  container.appendChild(mealList);

  const resetRow = el("div", { class: "cycle-reset" }, [
    el("button", { class: "secondary", id: "reset-cycle-btn", type: "button" },
      `Startdatum: ${formatDateDutch(getCycleStart())} — wijzigen`),
  ]);
  container.appendChild(resetRow);

  return container;
}

function formatQty(qty, unit) {
  if (unit === "g" && qty >= 1000) {
    const kg = qty / 1000;
    return `±${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`;
  }
  return `±${qty} ${unit}`;
}

function renderShoppingItem(weekNumber, item) {
  const checked = isItemChecked(weekNumber, item.key);
  const label = item.qty ? `${item.label} — ${formatQty(item.qty, item.unit)}` : item.label;

  const li = el("li", { class: "shopping-item" + (checked ? " is-checked" : "") });
  const checkBtn = el(
    "button",
    { type: "button", class: "meal-check" + (checked ? " is-checked" : ""), "aria-label": `${item.label} afvinken` },
    checked ? "✓" : ""
  );
  checkBtn.addEventListener("click", () => {
    const nowChecked = toggleItemChecked(weekNumber, item.key);
    li.classList.toggle("is-checked", nowChecked);
    checkBtn.classList.toggle("is-checked", nowChecked);
    checkBtn.textContent = nowChecked ? "✓" : "";
  });

  li.appendChild(checkBtn);
  li.appendChild(el("span", {}, label));
  return li;
}

function renderShoppingView() {
  const info = getMenuInfoForDate();

  if (!info) {
    return el("div", { class: "empty-state" }, [
      el("p", {}, "Stel eerst je cyclus-startdatum in bij 'Vandaag' om de boodschappenlijst te zien."),
      el("a", { class: "back-link", href: "#/" }, "← Naar Vandaag"),
    ]);
  }

  const weekNumber = info.weekNumber;
  const { quantified, seasoning } = getWeeklyShoppingList(info.week);
  const container = el("div", { class: "shopping-view" });

  container.appendChild(el("h2", {}, `Boodschappenlijst — Week ${weekNumber}`));
  container.appendChild(el("p", { class: "shopping-sub" }, info.week.phase));

  const byCategory = new Map();
  quantified.forEach((item) => {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push(item);
  });

  byCategory.forEach((items, category) => {
    const section = el("div", { class: "shopping-category" });
    section.appendChild(el("h3", {}, category));
    const ul = el("ul", { class: "shopping-items" });
    items.forEach((item) => ul.appendChild(renderShoppingItem(weekNumber, item)));
    section.appendChild(ul);
    container.appendChild(section);
  });

  if (seasoning.length) {
    const section = el("div", { class: "shopping-category" });
    section.appendChild(el("h3", {}, "Kruiden & aromaten"));
    section.appendChild(el("p", { class: "shopping-sub" }, "Check of je deze nog in huis hebt (geen exacte hoeveelheid nodig)."));
    const ul = el("ul", { class: "shopping-items" });
    seasoning.forEach((item) => ul.appendChild(renderShoppingItem(weekNumber, item)));
    section.appendChild(ul);
    container.appendChild(section);
  }

  return container;
}

function renderToday() {
  const viewedDate = addDays(new Date(), dayOffset);
  const info = getMenuInfoForDate(viewedDate);

  if (!info) {
    cycleStatus.textContent = "Cyclus nog niet ingesteld";
    app.appendChild(renderCycleSetupForm(false));
    return;
  }

  app.appendChild(renderDayView(info, viewedDate));

  const resetBtn = document.getElementById("reset-cycle-btn");
  resetBtn.addEventListener("click", () => {
    app.innerHTML = "";
    app.appendChild(renderCycleSetupForm(true));
  });

  const goToDay = (newOffset) => {
    dayOffset = newOffset;
    app.innerHTML = "";
    renderToday();
  };

  document.getElementById("day-prev").addEventListener("click", () => goToDay(dayOffset - 1));
  document.getElementById("day-next").addEventListener("click", () => goToDay(dayOffset + 1));
  const todayBtn = document.getElementById("day-today");
  if (todayBtn) todayBtn.addEventListener("click", () => goToDay(0));
}

const navToday = document.getElementById("nav-today");
const navShopping = document.getElementById("nav-shopping");
navToday.addEventListener("click", () => {
  dayOffset = 0;
});

function router() {
  app.innerHTML = "";
  window.scrollTo(0, 0);

  const hash = location.hash;
  const recipeMatch = hash.match(/^#\/recipe\/(.+)$/);
  const isShopping = hash === "#/shopping";

  navToday.classList.toggle("active", !isShopping);
  navShopping.classList.toggle("active", isShopping);

  if (recipeMatch) {
    app.appendChild(renderRecipeView(decodeURIComponent(recipeMatch[1])));
    return;
  }

  if (isShopping) {
    app.appendChild(renderShoppingView());
    return;
  }

  renderToday();
}

window.addEventListener("hashchange", router);
router();
