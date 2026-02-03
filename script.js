import {
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = window.db;
const ref = doc(db, "servicii", "calendar");

const functii = [
  "Ajutor OSU",
  "Sergent PCT",
  "Planton",
  "Patrulă",
  "Operator radio",
  "Intervenția 1",
  "Intervenția 2",
  "Responsabil"
];

function zile7() {
  const rez = [];
  const azi = new Date();

  for (let i = -1; i <= 5; i++) {
    const d = new Date(azi);
    d.setDate(azi.getDate() + i);
    rez.push(d);
  }
  return rez;
}

const container = document.getElementById("cards");

function key(d) {
  return d.toLocaleDateString("ro-RO");
}

async function save(data) {
  await setDoc(ref, { data }, { merge: true });
}

function render(storage = {}) {
  container.innerHTML = "";

  zile7().forEach(d => {
    const k = key(d);
    const azi = new Date().toDateString();

    const card = document.createElement("div");
    card.className = "card";

    if (d.toDateString() === azi) card.classList.add("azi");
    if (d < new Date(azi)) card.classList.add("ieri");

    card.innerHTML = `<h2>${k}</h2>`;

    functii.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "row";

      const label = document.createElement("span");
      label.textContent = f;

      const input = document.createElement("input");
      input.value = storage?.[k]?.[i] || "";

      input.onchange = async () => {
        storage[k] = storage[k] || [];
        storage[k][i] = input.value;
        await save(storage);
      };

      row.append(label, input);
      card.appendChild(row);
    });

    container.appendChild(card);
  });
}

render({});

onSnapshot(ref, snap => {
  render(snap.exists() ? snap.data().data : {});
});
