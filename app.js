/* Parkline Motors: car showcase
   Sample data only. Brands and models are fictional. */

const CARS = [
  {
    id: "lumen", brand: "Auralis", model: "Lumen", type: "sedan", year: 2026,
    fuel: "Electric", price: 48900, power: 340, accel: 5.1, range: 520, drive: "All-wheel drive", seats: 5,
    blurb: "A quiet, quick family sedan with a long range and a calm cabin.",
    features: ["Adaptive cruise control", "Heated front and rear seats", "Panoramic glass roof", "Wireless phone charging", "Over-the-air updates"],
    paints: [["Tidal blue", "#2b5c8a"], ["Ash", "#9aa3ab"], ["Ember", "#c8431d"], ["Pine", "#24433a"]],
  },
  {
    id: "kvarn", brand: "Norden", model: "Kvarn", type: "suv", year: 2026,
    fuel: "Hybrid", price: 57400, power: 290, accel: 6.8, range: 780, drive: "All-wheel drive", seats: 7,
    blurb: "Seven seats, a big boot and a hybrid engine that sips fuel on long trips.",
    features: ["Third row with its own air vents", "Hands-free tailgate", "360 degree camera", "Roof rails and tow bar", "Rear seat entertainment"],
    paints: [["Fjord", "#3d5a6c"], ["Birch", "#d9d5c9"], ["Cedar", "#7a4b2a"], ["Night", "#1d2630"]],
  },
  {
    id: "gt", brand: "Tramonto", model: "GT", type: "coupe", year: 2026,
    fuel: "Petrol", price: 89500, power: 520, accel: 3.9, range: 610, drive: "Rear-wheel drive", seats: 4,
    blurb: "A long-bonnet grand tourer built for fast, comfortable distance.",
    features: ["Twin-turbo V8", "Adaptive sport suspension", "Carbon ceramic brakes", "Leather and suede cabin", "Launch control"],
    paints: [["Ember", "#c8431d"], ["Saffron", "#e0a21b"], ["Slate", "#4a5560"], ["Pearl", "#e8e6e1"]],
  },
  {
    id: "pico", brand: "Brisa", model: "Pico", type: "hatchback", year: 2026,
    fuel: "Electric", price: 27900, power: 150, accel: 8.2, range: 360, drive: "Front-wheel drive", seats: 5,
    blurb: "A small electric hatchback that is easy to park and cheap to run.",
    features: ["Fits tight city parking", "Fast charging to 80% in 28 minutes", "Lane keep assist", "Folding rear seats", "Smartphone as key"],
    paints: [["Mint", "#6fbfa3"], ["Sky", "#7fb0e0"], ["Coral", "#e8715a"], ["Graphite", "#3a434b"]],
  },
  {
    id: "ridgeback", brand: "Halden", model: "Ridgeback", type: "suv", year: 2025,
    fuel: "Petrol", price: 44200, power: 250, accel: 7.4, range: 650, drive: "All-wheel drive", seats: 5,
    blurb: "A tough everyday SUV with extra ground clearance for rough roads.",
    features: ["Selectable terrain modes", "Raised ground clearance", "Underbody protection", "Roof rack mounts", "Heated steering wheel"],
    paints: [["Moss", "#5b6b3a"], ["Sand", "#c9b48a"], ["Flint", "#6b7279"], ["Rust", "#a8512a"]],
  },
  {
    id: "zero", brand: "Kaiju", model: "Zero", type: "coupe", year: 2026,
    fuel: "Electric", price: 72300, power: 480, accel: 3.4, range: 480, drive: "All-wheel drive", seats: 4,
    blurb: "An electric coupe with instant torque and a low, wide stance.",
    features: ["Dual motor drive", "Track mode with live power data", "Fixed glass roof", "Sport bucket seats", "Regenerative braking you can tune"],
    paints: [["Violet", "#5a3fa0"], ["Ice", "#cfe1ea"], ["Volt", "#b9d62c"], ["Onyx", "#1b2027"]],
  },
];

const TYPE_LABEL = { sedan: "Sedan", suv: "SUV", coupe: "Coupe", hatchback: "Hatchback" };
const TYPE_INLINE = { sedan: "sedan", suv: "SUV", coupe: "coupe", hatchback: "hatchback" };

/* Side-profile shapes drawn in a 400 x 160 box. Wheels sit at x = 100 and x = 300. */
const SHAPES = {
  sedan: {
    body: "M22 122 L26 104 Q28 96 40 94 L112 86 Q124 84 132 76 L160 54 Q166 50 176 50 L232 50 Q242 50 250 56 L270 76 Q276 82 288 84 L356 90 Q372 92 376 104 L378 122 Z",
    glass: "M166 59 L176 55 L228 55 L254 78 L140 80 Z",
    pillar: "M203 55 L203 79",
  },
  suv: {
    body: "M24 116 L28 84 Q30 76 40 74 L84 68 L110 34 Q114 28 122 28 L300 28 Q308 28 312 34 L332 68 L360 74 Q372 78 376 90 L378 116 Z",
    glass: "M120 38 L296 38 L316 66 L98 68 Z",
    pillar: "M206 38 L206 67",
    rails: "M126 24 L294 24",
  },
  coupe: {
    body: "M22 122 L26 108 Q30 100 44 98 L134 90 L190 66 Q198 62 208 62 L236 62 Q248 62 258 68 L296 90 L356 94 Q372 97 377 108 L378 122 Z",
    glass: "M196 71 L206 67 L234 67 L260 88 L158 90 Z",
    pillar: "M222 67 L222 89",
  },
  hatchback: {
    body: "M34 122 L36 80 Q38 72 46 70 L72 66 L106 40 Q112 36 120 36 L270 36 Q282 36 290 44 L312 72 L352 80 Q368 84 372 98 L374 122 Z",
    glass: "M114 45 L270 45 L296 70 L86 68 Z",
    pillar: "M196 45 L196 69",
  },
};

function carSVG(type, label) {
  const s = SHAPES[type];
  const wheel = (cx) => `
    <circle cx="${cx}" cy="124" r="30" fill="#0b1117"/>
    <circle cx="${cx}" cy="124" r="25" fill="#161e26"/>
    <circle cx="${cx}" cy="124" r="15" fill="#c9d0d6"/>
    <circle cx="${cx}" cy="124" r="13" fill="#9aa4ad"/>
    <circle cx="${cx}" cy="124" r="4" fill="#161e26"/>`;
  return `
    <svg class="car" viewBox="0 0 400 160" role="img" aria-label="${label}">
      <ellipse class="ground" cx="200" cy="153" rx="168" ry="6"/>
      <path class="paint" d="${s.body}"/>
      <path d="${s.body}" fill="url(#shade)"/>
      <path d="${s.glass}" fill="url(#glass)"/>
      <path d="${s.pillar}" stroke="#0f1822" stroke-width="4"/>
      ${s.rails ? `<path d="${s.rails}" stroke="#1b2733" stroke-width="4" stroke-linecap="round"/>` : ""}
      ${wheel(100)}${wheel(300)}
      <rect x="360" y="98" width="14" height="6" rx="3" fill="#fff" opacity=".85"/>
      <rect x="27" y="100" width="10" height="6" rx="3" fill="#ff4d3d" opacity=".9"/>
    </svg>`;
}

/* ---------- helpers ---------- */
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const $ = (sel, root = document) => root.querySelector(sel);
const carById = (id) => CARS.find((c) => c.id === id);
const fullName = (c) => `${c.brand} ${c.model}`;

const state = { filter: "all", sort: "featured", paint: {} }; // paint: car id -> index
CARS.forEach((c) => (state.paint[c.id] = 0));

function swatchesHTML(car, selected) {
  return car.paints
    .map(
      ([name, hex], i) =>
        `<button type="button" class="swatch" data-paint="${i}" style="--swatch:${hex}" title="${name}" aria-label="${name}" aria-pressed="${i === selected}"></button>`
    )
    .join("");
}

function specsHTML(car) {
  return `
    <dl class="specs">
      <div><dt>Power</dt><dd>${car.power} <small>hp</small></dd></div>
      <div><dt>0 to 100 km/h</dt><dd>${car.accel.toFixed(1)} <small>s</small></dd></div>
      <div><dt>Range</dt><dd>${car.range} <small>km</small></dd></div>
    </dl>`;
}

/* Apply a paint to a container (card, hero or dialog) and update its swatch state. */
function applyPaint(container, car, index) {
  const [name, hex] = car.paints[index];
  container.style.setProperty("--paint", hex);
  container.querySelectorAll(".swatch").forEach((b, i) => b.setAttribute("aria-pressed", String(i === index)));
  const svg = container.querySelector("svg.car");
  if (svg) svg.setAttribute("aria-label", `${fullName(car)} in ${name}`);
  const label = container.querySelector(".paint-name");
  if (label) label.textContent = name;
}

/* ---------- hero ---------- */
const HERO_ID = "gt";

function renderHero() {
  const car = carById(HERO_ID);
  const hero = $("#hero");
  hero.innerHTML = `
    ${carSVG(car.type, fullName(car))}
    <div class="hero-info">
      <div>
        <h2>${fullName(car)}</h2>
        <p class="price">From ${money.format(car.price)}</p>
      </div>
      <div class="hero-actions">
        <div class="swatches" role="group" aria-label="Paint color">${swatchesHTML(car, 0)}</div>
        <span class="paint-name" aria-live="polite"></span>
        <button type="button" class="btn ghost" data-open="${car.id}">View details</button>
      </div>
    </div>`;
  applyPaint(hero, car, 0);
  hero.addEventListener("click", (e) => {
    const sw = e.target.closest(".swatch");
    if (sw) {
      state.paint[car.id] = Number(sw.dataset.paint);
      applyPaint(hero, car, state.paint[car.id]);
    }
  });
}

/* ---------- lineup ---------- */
function renderFilters() {
  const types = ["all", ...new Set(CARS.map((c) => c.type))];
  $("#filters").innerHTML = types
    .map((t) => `<button type="button" class="chip" data-filter="${t}" aria-pressed="${t === state.filter}">${t === "all" ? "All cars" : TYPE_LABEL[t]}</button>`)
    .join("");
}

function sortedCars() {
  const list = CARS.filter((c) => state.filter === "all" || c.type === state.filter);
  const by = {
    featured: null,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    power: (a, b) => b.power - a.power,
    accel: (a, b) => a.accel - b.accel,
  }[state.sort];
  return by ? [...list].sort(by) : list;
}

function cardHTML(car) {
  const idx = state.paint[car.id];
  return `
    <article class="card" data-id="${car.id}">
      <div class="stage">${carSVG(car.type, fullName(car))}</div>
      <div class="card-body">
        <div class="card-top">
          <h3><span class="brand">${car.brand}</span>${car.model}</h3>
          <p class="price">${money.format(car.price)}</p>
        </div>
        <p class="meta">${car.year} ${TYPE_INLINE[car.type]}, ${car.fuel.toLowerCase()}</p>
        ${specsHTML(car)}
      </div>
      <div class="card-foot">
        <div class="swatches" role="group" aria-label="Paint color for ${fullName(car)}">${swatchesHTML(car, idx)}</div>
        <button type="button" class="btn ghost" data-open="${car.id}" aria-label="View details for ${fullName(car)}">View details</button>
      </div>
    </article>`;
}

function renderGrid() {
  const cars = sortedCars();
  $("#grid").innerHTML = cars.map(cardHTML).join("");
  cars.forEach((car) => {
    const el = $(`.card[data-id="${car.id}"]`);
    applyPaint(el, car, state.paint[car.id]);
  });
  $("#count").textContent = `Showing ${cars.length} of ${CARS.length} cars`;
}

/* ---------- detail dialog ---------- */
const dialog = $("#detail");

function openDetail(id) {
  const car = carById(id);
  const body = $("#detail-body");
  body.innerHTML = `
    <div class="detail-stage">
      ${carSVG(car.type, fullName(car))}
      <div class="hero-actions">
        <div class="swatches" role="group" aria-label="Paint color">${swatchesHTML(car, state.paint[car.id])}</div>
        <span class="paint-name" aria-live="polite"></span>
      </div>
    </div>
    <div class="detail-info">
      <div>
        <p class="brand">${car.brand}</p>
        <h2 id="detail-title">${car.model}</h2>
      </div>
      <p class="price">${money.format(car.price)}</p>
      <p class="blurb">${car.blurb}</p>
      <dl class="facts">
        <div><dt>Body</dt><dd>${TYPE_LABEL[car.type]}</dd></div>
        <div><dt>Year</dt><dd>${car.year}</dd></div>
        <div><dt>Fuel</dt><dd>${car.fuel}</dd></div>
        <div><dt>Drive</dt><dd>${car.drive}</dd></div>
        <div><dt>Power</dt><dd>${car.power} hp</dd></div>
        <div><dt>0 to 100 km/h</dt><dd>${car.accel.toFixed(1)} s</dd></div>
        <div><dt>Range</dt><dd>${car.range} km</dd></div>
        <div><dt>Seats</dt><dd>${car.seats}</dd></div>
      </dl>
      <div>
        <h3>Key features</h3>
        <ul class="features">${car.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      </div>
      <div class="detail-actions">
        <button type="button" class="btn primary" data-close>Close</button>
      </div>
    </div>`;
  // The dialog body is the element that carries --paint.
  applyPaint(body, car, state.paint[car.id]);
  body.dataset.car = car.id;
  dialog.showModal();
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open]");
  if (open) return openDetail(open.dataset.open);

  if (e.target.closest("[data-close]")) return dialog.close();

  const chip = e.target.closest(".chip");
  if (chip) {
    state.filter = chip.dataset.filter;
    renderFilters();
    return renderGrid();
  }

  // Paint swatches on cards and in the dialog (hero handles its own).
  const sw = e.target.closest(".swatch");
  if (sw && !sw.closest("#hero")) {
    const card = sw.closest(".card");
    const host = card || $("#detail-body");
    const car = carById(card ? card.dataset.id : host.dataset.car);
    state.paint[car.id] = Number(sw.dataset.paint);
    applyPaint(host, car, state.paint[car.id]);
    // Keep the card for this car in sync if the dialog changed it.
    if (!card) {
      const cardEl = $(`.card[data-id="${car.id}"]`);
      if (cardEl) applyPaint(cardEl, car, state.paint[car.id]);
    }
  }
});

// Close the dialog when the dark backdrop is clicked.
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

$("#sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderGrid();
});

renderHero();
renderFilters();
renderGrid();
