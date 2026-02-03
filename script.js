import {
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   FIREBASE
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

/* =========================
   CALENDAR – 7 ZILE
========================= */
function genereazaZile() {
  const zile = [];
  const azi = new Date();
  const start = new Date(azi);
  start.setDate(azi.getDate() - 1); // IERI

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    zile.push(
      d.toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    );
  }
  return zile;
}

const zile = genereazaZile();

/* =========================
   CONTAINER
========================= */
const container = document.getElementById("cards");

/* =========================
   SALVARE SIGURĂ (fără undefined)
========================= */
async function salveazaCurat(data) {
  const curat = JSON.parse(JSON.stringify(data));
  await setDoc(ref, { data: curat }, { merge: true });
}

/* =========================
   RANDARE UI
========================= */
function randare(storage = {}) {
  container.innerHTML = "";

  zile.forEach(zi => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `<h2>📅 ${zi}</h2>`;

    functii.forEach((functie, idx) => {
      const row = document.createElement("div");
      row.className = "row";

      const label = document.createElement("span");
      label.textContent = functie;

      const select = document.createElement("select");

      // opțiune implicită
      const optDefault = document.createElement("option");
      optDefault.value = "Din altă subunitate";
      optDefault.textContent = "Din altă subunitate";
      select.appendChild(optDefault);

      // persoane
      persoane
        .filter(p => p !== "Din altă subunitate")
        .forEach(p => {
          const opt = document.createElement("option");
          opt.value = p;
          opt.textContent = p;
          select.appendChild(opt);
        });

      // valoare curentă
      select.value = storage?.[zi]?.[idx] || "Din altă subunitate";

      // schimbare
      select.onchange = async () => {
        storage[zi] = storage[zi] || [];
        storage[zi][idx] = select.value;
        await salveazaCurat(storage);
      };

      row.appendChild(label);
      row.appendChild(select);
      card.appendChild(row);
    });

    container.appendChild(card);
  });
}

/* =========================
   AFIȘARE INSTANT (FĂRĂ AȘTEPTARE)
========================= */
randare({});

/* =========================
   FIRESTORE LIVE SYNC
========================= */
onSnapshot(ref, snap => {
  if (!snap.exists()) {
    randare({});
  } else {
    randare(snap.data().data || {});
  }
});
