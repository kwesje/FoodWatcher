import { RECIPES } from "./data.js";
import { getCycleStart, setCycleStart, CYCLE_LENGTH } from "./cycle.js";
import { getMenuInfoForDate } from "./menu.js";

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
    render();
  });

  wrapper.appendChild(form);
  return wrapper;
}

function renderMealCard(type, meal) {
  const card = el("div", { class: "meal-card" });
  card.appendChild(el("div", { class: "meal-type" }, MEAL_LABELS[type]));

  if (type === "snack") {
    card.appendChild(el("div", { class: "meal-name" }, meal));
    return card;
  }

  if (meal === null) {
    card.appendChild(el("div", { class: "meal-name" }, "Leftovers / vrije keuze"));
    card.appendChild(el("div", { class: "meal-macros" }, "Flexibel: restjes, uit eten of iets uit de koelkast."));
    return card;
  }

  const recipe = RECIPES[meal];
  card.appendChild(el("div", { class: "meal-name" }, recipe.name));
  card.appendChild(el("div", { class: "meal-macros" }, `±${recipe.kcal} kcal | ±${recipe.protein} g eiwit`));
  return card;
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

  const mealList = el("div", { class: "meal-list" });
  mealList.appendChild(renderMealCard("ontbijt", info.day.ontbijt));
  mealList.appendChild(renderMealCard("lunch", info.day.lunch));
  mealList.appendChild(renderMealCard("snack", info.day.snack));
  mealList.appendChild(renderMealCard("diner", info.day.diner));
  container.appendChild(mealList);

  const resetRow = el("div", { class: "cycle-reset" }, [
    el("button", { class: "secondary", id: "reset-cycle-btn", type: "button" },
      `Startdatum: ${formatDateDutch(getCycleStart())} — wijzigen`),
  ]);
  container.appendChild(resetRow);

  return container;
}

function render() {
  app.innerHTML = "";

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

render();
