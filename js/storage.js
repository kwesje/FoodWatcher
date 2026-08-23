// Kleine wrapper rond localStorage: alles opgeslagen onder een gezamenlijk prefix,
// met veilige fallback als localStorage niet beschikbaar is (bv. privénavigatie).

const PREFIX = "fw_";

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage niet beschikbaar; app blijft werken maar onthoudt niets.
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // negeren
  }
}
