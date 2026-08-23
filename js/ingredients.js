// Canonieel naslagwerk voor boodschappen-ingredienten: per sleutel het label
// en de boodschappencategorie. Wordt gebruikt om de wekelijkse boodschappenlijst
// nauwkeurig te berekenen uit de receptdata (zie weeklyShopping.js).

export const INGREDIENT_CATALOG = {
  // Zuivel
  "griekse-yoghurt": { label: "Griekse yoghurt 0–2% / skyr", category: "Zuivel", unit: "g" },
  "cottage-cheese": { label: "Cottage cheese / hüttenkäse", category: "Zuivel", unit: "g" },
  feta: { label: "Feta", category: "Zuivel", unit: "g" },
  parmezaan: { label: "Parmezaanse kaas", category: "Zuivel", unit: "g" },
  eieren: { label: "Eieren", category: "Zuivel", unit: "stuks" },

  // Vlees/vis
  kipfilet: { label: "Kipfilet", category: "Vlees/vis", unit: "g" },
  kalkoengehakt: { label: "Mager kalkoengehakt", category: "Vlees/vis", unit: "g" },
  rundergehakt: { label: "Mager rundergehakt 5%", category: "Vlees/vis", unit: "g" },
  garnalen: { label: "Garnalen", category: "Vlees/vis", unit: "g" },
  "tonijn-blik": { label: "Tonijn op water (blik)", category: "Vlees/vis", unit: "blik" },

  // Peulvruchten
  "linzen-blik": { label: "Linzen (blik)", category: "Peulvruchten", unit: "blik" },
  "linzen-droog": { label: "Rode linzen (droog)", category: "Peulvruchten", unit: "g" },
  "kikkererwten-blik": { label: "Kikkererwten (blik)", category: "Peulvruchten", unit: "blik" },
  "witte-bonen-blik": { label: "Witte bonen (blik)", category: "Peulvruchten", unit: "blik" },
  "zwarte-bonen-blik": { label: "Zwarte bonen (blik)", category: "Peulvruchten", unit: "blik" },
  "kidneybonen-blik": { label: "Kidneybonen (blik)", category: "Peulvruchten", unit: "blik" },
  edamame: { label: "Edamame (diepvries)", category: "Peulvruchten", unit: "g" },
  hummus: { label: "Hummus", category: "Peulvruchten", unit: "g" },

  // Granen
  quinoa: { label: "Quinoa (droog)", category: "Granen", unit: "g" },
  "zilvervliesrijst-droog": { label: "Zilvervliesrijst (droog)", category: "Granen", unit: "g" },
  havermout: { label: "Havermout", category: "Granen", unit: "g" },
  volkorenbrood: { label: "Volkorenbrood", category: "Granen", unit: "g" },
  "volkoren-wraps": { label: "Volkoren wraps", category: "Granen", unit: "stuks" },
  "volkoren-spaghetti": { label: "Volkoren spaghetti", category: "Granen", unit: "g" },

  // Groenten
  "zoete-aardappel": { label: "Zoete aardappel", category: "Groenten", unit: "g" },
  broccoli: { label: "Broccoli", category: "Groenten", unit: "g" },
  spruitjes: { label: "Spruitjes", category: "Groenten", unit: "g" },
  boerenkool: { label: "Boerenkool", category: "Groenten", unit: "g" },
  spinazie: { label: "Spinazie", category: "Groenten", unit: "g" },
  komkommer: { label: "Komkommer", category: "Groenten", unit: "g" },
  tomaat: { label: "Tomaat", category: "Groenten", unit: "g" },
  rucola: { label: "Rucola", category: "Groenten", unit: "g" },
  ui: { label: "Ui", category: "Groenten", unit: "g" },
  "rode-ui": { label: "Rode ui", category: "Groenten", unit: "g" },
  avocado: { label: "Avocado", category: "Groenten", unit: "g" },
  aubergine: { label: "Aubergine", category: "Groenten", unit: "g" },
  bloemkool: { label: "Bloemkool", category: "Groenten", unit: "g" },
  champignons: { label: "Champignons", category: "Groenten", unit: "g" },
  krieltjes: { label: "Krieltjes", category: "Groenten", unit: "g" },
  biet: { label: "Gekookte biet", category: "Groenten", unit: "g" },
  sla: { label: "Sla", category: "Groenten", unit: "g" },
  mais: { label: "Mais", category: "Groenten", unit: "g" },

  // Fruit
  bessen: { label: "Blauwe bessen / gemengde bessen", category: "Fruit", unit: "g" },
  "aardbeien-frambozen": { label: "Aardbeien / frambozen", category: "Fruit", unit: "g" },
  sinaasappel: { label: "Sinaasappel", category: "Fruit", unit: "stuks" },
  appel: { label: "Appel", category: "Fruit", unit: "stuks" },
  banaan: { label: "Banaan", category: "Fruit", unit: "stuks" },
  peer: { label: "Peer", category: "Fruit", unit: "stuks" },
  kiwi: { label: "Kiwi", category: "Fruit", unit: "stuks" },

  // Vetten/toppings
  walnoten: { label: "Walnoten", category: "Vetten/toppings", unit: "g" },
  pompoenpitten: { label: "Pompoenpitten", category: "Vetten/toppings", unit: "g" },
  lijnzaad: { label: "Gemalen lijnzaad", category: "Vetten/toppings", unit: "g" },
  pindakaas: { label: "Pindakaas", category: "Vetten/toppings", unit: "g" },
  "pure-chocolade": { label: "85% pure chocolade", category: "Vetten/toppings", unit: "g" },
  olijfolie: { label: "Extra vierge olijfolie", category: "Vetten/toppings", unit: "g" },
  tahin: { label: "Tahin", category: "Vetten/toppings", unit: "g" },
  cashewnoten: { label: "Cashewnoten", category: "Vetten/toppings", unit: "g" },
  amandelen: { label: "Amandelen", category: "Vetten/toppings", unit: "g" },
  pistachenoten: { label: "Pistachenoten", category: "Vetten/toppings", unit: "g" },
  sesamzaad: { label: "Sesamzaad", category: "Vetten/toppings", unit: "g" },
  sesamolie: { label: "Sesamolie", category: "Vetten/toppings", unit: "g" },

  // Voorraad (gekwantificeerd)
  "tomatenblokjes-blik": { label: "Tomatenblokjes (blik)", category: "Voorraad", unit: "blik" },
  passata: { label: "Passata", category: "Voorraad", unit: "pak" },
  "kokosmelk-light-blik": { label: "Lichte kokosmelk (blik)", category: "Voorraad", unit: "blik" },
  "tamari-sojasaus": { label: "Tamari / sojasaus", category: "Voorraad", unit: "g" },

  // Kruiden & aromaten (ongekwantificeerd, wel specifiek benoemd)
  peper: { label: "Zwarte peper", category: "Kruiden & aromaten" },
  knoflook: { label: "Knoflook (vers)", category: "Kruiden & aromaten" },
  knoflookpoeder: { label: "Knoflookpoeder", category: "Kruiden & aromaten" },
  paprikapoeder: { label: "Paprikapoeder", category: "Kruiden & aromaten" },
  "gerookt-paprikapoeder": { label: "Gerookt paprikapoeder", category: "Kruiden & aromaten" },
  komijn: { label: "Komijn(poeder)", category: "Kruiden & aromaten" },
  oregano: { label: "Oregano (gedroogd)", category: "Kruiden & aromaten" },
  basilicum: { label: "Basilicum (gedroogd)", category: "Kruiden & aromaten" },
  kaneel: { label: "Kaneel", category: "Kruiden & aromaten" },
  chilivlokken: { label: "Chilivlokken", category: "Kruiden & aromaten" },
  chilipoeder: { label: "Chilipoeder", category: "Kruiden & aromaten" },
  dille: { label: "Dille (vers of gedroogd)", category: "Kruiden & aromaten" },
  tijm: { label: "Tijm (gedroogd)", category: "Kruiden & aromaten" },
  curry: { label: "Currypoeder", category: "Kruiden & aromaten" },
  kurkuma: { label: "Kurkuma", category: "Kruiden & aromaten" },
  gember: { label: "Gember (vers)", category: "Kruiden & aromaten" },
  mosterd: { label: "Mosterd", category: "Kruiden & aromaten" },
  citroen: { label: "Citroen", category: "Kruiden & aromaten" },
  limoen: { label: "Limoen", category: "Kruiden & aromaten" },
};
