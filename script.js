import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   FIREBASE – AICI, NU ÎN HTML
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyDapdObzYLSBHMzq9bJzp3CvJfKgAfao",
  authDomain: "servicii-de-zi.firebaseapp.com",
  projectId: "servicii-de-zi"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ref = doc(db, "servicii", "calendar");

/* =========================
   DATE
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
  "Planton",
  "Patrulă",
  "Operator radio",
  "Intervenția 1",
  "Intervenția 2"
];

const reguliServicii = {
  "Ajutor OSU": persoane.filter(p => p.startsWith("lt")),
  "Planton": persoane.filter(p => p.startsWith("sold")),
  "Patrulă": persoane.filter(p => p.startsWith("sold")),
  "Operator radio": persoane.filter(p => p.startsWith("sg")),
  "Intervenția 1": persoane.filter(p => p !== "Din altă subunitate"),
  "Intervenția 2": persoane.filter(p => p !== "Din altă subunitate")
};

/* =========================
   ZILE – IERI + 6
========================= */
function zile7() {
  const arr = [];
  const azi = new Date();
  for (let i = -1; i <= 5; i++) {
    const d = new Date(azi);
    d.setDate(azi.getDate() + i);
    arr.push(d.toLocaleDateString("ro-RO"));
  }
  return arr;
}

const zile = zile7();

/* =========================
   UI
========================= */
const container = document.getElementById("cards");

function render(data = {}) {
  container.innerHTML = "";

  zile.forEach(zi => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h2>${zi}</h2>`;

    functii.forEach((f, idx) => {
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

      select.value = data?.[zi]?.[idx] || "Din altă subunitate";

      select.onchange = async () => {
        data[zi] = data[zi] || [];
        data[zi][idx] = select.value;
        await setDoc(ref, { data }, { merge: true });
      };

      row.append(label, select);
      card.appendChild(row);
    });

    container.appendChild(card);
  });
}

/* =========================
   LIVE SYNC
========================= */
render({});

onSnapshot(ref, snap => {
  render(snap.exists() ? snap.data().data : {});
});
