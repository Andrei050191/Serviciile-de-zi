import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIGURATIA FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDapdObzYLSBHMzq9bJzp3CvJfKgAfao",
  authDomain: "servicii-de-zi.firebaseapp.com",
  projectId: "servicii-de-zi"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ref = doc(db, "servicii", "calendar");

// --- LOGICA ACCES ---
const COD_CORECT = "1234"; 
const loginScreen = document.getElementById('login-screen');
const mainContent = document.getElementById('main-content');
const pinInput = document.getElementById('pin-input');
const loginBtn = document.getElementById('login-btn');
const errorMsg = document.getElementById('error-msg');

if (localStorage.getItem('acces_aprobat') === 'true') {
  afiseazaAplicatia();
}

loginBtn.onclick = () => {
  if (pinInput.value === COD_CORECT) {
    localStorage.setItem('acces_aprobat', 'true');
    afiseazaAplicatia();
  } else {
    errorMsg.style.display = 'block';
    pinInput.value = '';
  }
};

function afiseazaAplicatia() {
  loginScreen.style.display = 'none';
  mainContent.style.display = 'block';
  onSnapshot(ref, (snap) => {
    const data = snap.exists() ? snap.data().data || {} : {};
    randare(data);
  });
}

// --- DATE ȘI REGULI ---
const persoane = [
  "Din altă subunitate", "lt.col. Bordea Andrei", "lt. Bodiu Sergiu", "lt. Dermindje Mihail", 
  "lt. Samoschin Anton", "sg.II Plugaru Iurie", "sg.III Botnari Anastasia", "sg.III Murafa Oleg", 
  "sg.III Ungureanu Andrei", "sg.III Zamaneagra Aliona", "cap. Boțoc Dumitru", "sold.I Răileanu Marina", 
  "sold.I Rotari Natalia", "sold.I Smirnov Silvia", "sold.I Tuceacov Nicolae", "sold.I Pinzari Vladimir", 
  "sold.II Cucer Oxana", "sold.III Roler Ira", "sold.III Vovc Dan"
];

const functii = ["Ajutor OSU", "Sergent de serviciu PCT", "Planton", "Patrulă", "Operator radio", "Intervenția 1", "Intervenția 2", "Responsabil"];

const reguliServicii = {
  "Ajutor OSU": ["lt. Bodiu Sergiu", "lt. Dermindje Mihail", "lt. Samoschin Anton"],
  "Sergent de serviciu PCT": ["sg.II Plugaru Iurie", "sg.III Zamaneagra Aliona", "sg.III Murafa Oleg", "cap. Boțoc Dumitru", "sold.I Pinzari Vladimir"],
  "Planton": ["sold.II Cucer Oxana", "sold.III Roler Ira"],
  "Patrulă": ["sold.I Tuceacov Nicolae", "sold.III Vovc Dan"],
  "Operator radio": ["sg.III Ungureanu Andrei", "sg.III Botnari Anastasia", "sold.I Smirnov Silvia"],
  "Intervenția 1": persoane.filter(p => p !== "Din altă subunitate"),
  "Intervenția 2": persoane.filter(p => p !== "Din altă subunitate"),
  "Responsabil": ["lt.col. Bordea Andrei"]
};

function genereazaZile() {
  const zile = [];
  const azi = new Date();
  for (let i = -1; i < 6; i++) {
    const d = new Date();
    d.setDate(azi.getDate() + i);
    zile.push(d.toLocaleDateString("ro-RO"));
  }
  return zile;
}

const zileAfisate = genereazaZile();
const container = document.getElementById("cards");

async function salveaza(toateDatele) {
  await setDoc(ref, { data: toateDatele }, { merge: true });
}

function randare(storage) {
  container.innerHTML = "";
  const acum = new Date();
  const aziStr = acum.toLocaleDateString("ro-RO");
  const ieriStr = new Date(acum.getTime() - 86400000).toLocaleDateString("ro-RO");
  const maineStr = new Date(acum.getTime() + 86400000).toLocaleDateString("ro-RO");

  zileAfisate.forEach(zi => {
    const card = document.createElement("div");
    card.className = "card";
    let eticheta = "";
    if (zi === ieriStr) { card.classList.add("ieri"); eticheta = " (IERI)"; }
    else if (zi === aziStr) { card.classList.add("azi"); eticheta = " (AZI)"; }
    else if (zi === maineStr) { card.classList.add("maine"); eticheta = " (MÂINE)"; }

    // TITLUL CARDULUI CU STEMĂ
    card.innerHTML = `
      <h2 style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Coat_of_arms_of_Moldova.svg/100px-Coat_of_arms_of_Moldova.svg.png" style="width: 25px; height: auto;">
        ${zi}${eticheta}
      </h2>`;

    functii.forEach((f, indexFunctie) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<span>${f}</span>`;
      const select = document.createElement("select");
      select.add(new Option("Din altă subunitate", "Din altă subunitate"));
      (reguliServicii[f] || []).forEach(p => { if (p !== "Din altă subunitate") select.add(new Option(p, p)); });
      select.value = storage?.[zi]?.[indexFunctie] || "Din altă subunitate";
      select.onchange = () => {
        if (!storage[zi]) storage[zi] = new Array(functii.length).fill("Din altă subunitate");
        storage[zi][indexFunctie] = select.value;
        salveaza(storage);
      };
      row.appendChild(select);
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}