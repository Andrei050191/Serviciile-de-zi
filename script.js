import {
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   CONFIG
========================= */
const db = window.db;
const ref = doc(db, "servicii", "calendar");

/* =========================
   DATE STATICE
========================= */
const persoane = [
  "Din altă subunitate",

  "lt.col. Bordea Andrei",
  "lt. Bodiu Sergiu",
  "lt. Dermindje Mihail",
  "lt. Samoschin Anton",

  "sg.II Plugaru Iurie",
  "sg.III Botnari Anastasia",
  "sg.III Murafa Oleg",
  "sg.III Ungureanu Andrei",
  "sg.III Zamaneagra Aliona",

  "cap. Boțoc Dumitru",

  "sold.I Macovei Natalia",
  "sold.I Răileanu Marina",
  "sold.I Rotari Natalia",
  "sold.I Smirnov Silvia",
  "sold.I Tuceacov Nicolae",
  "sold.I Pinzari Vladimir",

  "sold.II Cucer Oxana",

  "sold.III Roler Ira",
  "sold.III Vovc Dan"
];

const functii = [
  "Ajutor OSU",
  "Sergent de serviciu PCT",
  "Planton",
  "Patrulă",
  "Operator radio",
  "Intervenția 1",
  "Intervenția 2"
];

const reguliServicii = {
  "Ajutor OSU": [
    "lt.col. Bordea Andrei",
    "lt. Bodiu Sergiu",
    "lt. Dermindje Mihail",
    "lt. Samoschin Anton"
  ],
  "Sergent de serviciu PCT": [
    "sg.II Plugaru Iurie",
    "sg.III Zamaneagra Aliona",
    "sg.III Murafa Oleg",
    "cap. Boțoc Dumitru",
    "sold.I Pinzari Vladimir"
  ],
  "Planton": [
    "sold.II Cucer Oxana",
    "sold.III Roler Ira"
  ],
  "Patrulă": [
    "sold.I Tuceacov Nicolae",
    "sold.III Vovc Dan"
  ],
  "Operator radio": [
    "sg.III Ungureanu Andrei",
    "sg.III Botnari Anastasia",
    "sold.I Smirnov Silvia"
  ],
  "Intervenția 1": persoane.filter(p => p !== "Din altă subunitate"),
  "Intervenția 2": persoane.filter(p => p !== "Din altă subunitate")
};

/* =========================
   CALENDAR 7 ZILE (IERI →)
========================= */
function genereazaZile() {
  const zile = [];
  const azi = new Date();
  const start = new Date(azi);
  start.setDate(azi.getDate() - 1);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    zile.push(d.toLocaleDateString("ro-RO"));
  }
  return zile;
}

const zile = genereazaZile();

/* =========================
   FIRESTORE SYNC
========================= */
const container = document.getElementById("cards");

onSnapshot(ref, snap => {
  const data = snap.exists() ? snap.data().data || {} : {};
  randare(data);
});

async function salveaza(data) {
  await setDoc(ref, { data }, { merge: true });
}

/* =========================
   UI
========================= */
function randare(storage) {
  container.innerHTML = "";

  zile.forEach(zi => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h2>📅 ${zi}</h2>`;

    functii.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "row";

      const label = document.createElement("span");
      label.textContent = f;

      const select = document.createElement("select");

      const opt0 = document.createElement("option");
      opt0.value = "Din altă subunitate";
      opt0.textContent = "Din altă subunitate";
      select.appendChild(opt0);

      (reguliServicii[f] || []).forEach(p => {
        const o = document.createElement("option");
        o.value = p;
        o.textContent = p;
        select.appendChild(o);
      });

      select.value = storage?.[zi]?.[i] || "Din altă subunitate";

      select.onchange = () => {
        storage[zi] = storage[zi] || [];
        storage[zi][i] = select.value;
        salveaza(storage);
      };

      row.appendChild(label);
      row.appendChild(select);
      card.appendChild(row);
    });

    container.appendChild(card);
  });
}
