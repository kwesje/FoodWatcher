import { RECIPES, SHOPPING_LISTS } from "./data.js";
import { getCycleStart, setCycleStart, CYCLE_LENGTH } from "./cycle.js";
import { getMenuInfoForDate } from "./menu.js";
import { dateKey, isMealChecked, toggleMealChecked } from "./checkoff.js";
import { itemId, isItemChecked, toggleItemChecked } from "./shopping.js";

const app = document.getElementById("app");
const cycleStatus = document.getElementById("cycle-status");

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

function renderCycleSetupForm(isReset) {
  const wrapper = el("section", { class: "cycle-setup" }, [
    el("p", {}, isReset
      ? "Wanneer is je huidige cyclus begonnen?"
      : "Stel eenmalig in wanneer je laatste menstruatie is begonnen, dan berekent de app automatisch in welke week en fase je zit."),
  ]);

  const form = el("form");
  const dateInput = el("input", { type: "date", id: "cycle-start-input", value: todayISO() });
  const submit = el("button", { type: "submit" }, "Mijn menstruatie is vandaag gestart");
  form.appendChild(dateInput);
  form.appendChild(submit);

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

function renderMealCard(type, meal, key) {
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
  recipe.ingredients.forEach((ingredient) => ingredientsList.appendChild(el("li", {}, ingredient)));
  container.appendChild(ingredientsList);

  container.appendChild(el("h3", {}, "Bereiding"));
  const stepsList = el("ol", { class: "step-list" });
  recipe.steps.forEach((step) => stepsList.appendChild(el("li", {}, step)));
  container.appendChild(stepsList);

  container.appendChild(el("h3", {}, "Bewaren/mealprep"));
  container.appendChild(el("p", { class: "recipe-storage" }, recipe.storage));

  return container;
}

function renderDayView(info) {
  cycleStatus.textContent = `${info.week.phase} · Week ${info.weekNumber} · Dag ${info.cycleDay}/${CYCLE_LENGTH}`;

  const container = el("div");

  container.appendChild(
    el("div", { class: "day-header" }, [
      el("div", { class: "phase" }, info.week.phase),
      el("div", { class: "range" }, `${info.week.cyclusRange} · vandaag is cyclusdag ${info.cycleDay}`),
    ])
  );

  const key = dateKey();
  const mealList = el("div", { class: "meal-list" });
  mealList.appendChild(renderMealCard("ontbijt", info.day.ontbijt, key));
  mealList.appendChild(renderMealCard("lunch", info.day.lunch, key));
  mealList.appendChild(renderMealCard("snack", info.day.snack, key));
  mealList.appendChild(renderMealCard("diner", info.day.diner, key));
  container.appendChild(mealList);

  const resetRow = el("div", { class: "cycle-reset" }, [
    el("button", { class: "secondary", id: "reset-cycle-btn", type: "button" },
      `Startdatum: ${formatDateDutch(getCycleStart())} — wijzigen`),
  ]);
  container.appendChild(resetRow);

  return container;
}

function renderShoppingItem(weekNumber, category, item) {
  const id = itemId(category, item);
  const checked = isItemChecked(weekNumber, id);

  const li = el("li", { class: "shopping-item" + (checked ? " is-checked" : "") });
  const checkBtn = el(
    "button",
    { type: "button", class: "meal-check" + (checked ? " is-checked" : ""), "aria-label": `${item} afvinken` },
    checked ? "✓" : ""
  );
  checkBtn.addEventListener("click", () => {
    const nowChecked = toggleItemChecked(weekNumber, id);
    li.classList.toggle("is-checked", nowChecked);
    checkBtn.classList.toggle("is-checked", nowChecked);
    checkBtn.textContent = nowChecked ? "✓" : "";
  });

  li.appendChild(checkBtn);
  li.appendChild(el("span", {}, item));
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
  const list = SHOPPING_LISTS[weekNumber];
  const container = el("div", { class: "shopping-view" });

  container.appendChild(el("h2", {}, `Boodschappenlijst — Week ${weekNumber}`));
  container.appendChild(el("p", { class: "shopping-sub" }, info.week.phase));

  Object.entries(list).forEach(([category, items]) => {
    const section = el("div", { class: "shopping-category" });
    section.appendChild(el("h3", {}, category));
    const ul = el("ul", { class: "shopping-items" });
    items.forEach((item) => ul.appendChild(renderShoppingItem(weekNumber, category, item)));
    section.appendChild(ul);
    container.appendChild(section);
  });

  return container;
}

function renderToday() {
  const info = getMenuInfoForDate();

  if (!info) {
    cycleStatus.textContent = "Cyclus nog niet ingesteld";
    app.appendChild(renderCycleSetupForm(false));
    return;
  }

  app.appendChild(renderDayView(info));

  const resetBtn = document.getElementById("reset-cycle-btn");
  resetBtn.addEventListener("click", () => {
    app.innerHTML = "";
    app.appendChild(renderCycleSetupForm(true));
  });
}

const navToday = document.getElementById("nav-today");
const navShopping = document.getElementById("nav-shopping");

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
