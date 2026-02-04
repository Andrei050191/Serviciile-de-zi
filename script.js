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
const COD_CORECT = "4321"; 
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
  "sold.I Răileanu Marina", 
  "sold.I Rotari Natalia", 
  "sold.I Smirnov Silvia", 
  "sold.I Tuceacov Nicolae", 
  "cap. Pinzari Vladimir", 
  "sold.II Cucer Oxana",
  "sold.II Vovc Dan", 
  "sold.III Roler Ira" 
  
];

const functii = [
  "Ajutor OSU", 
  "Sergent de serviciu PCT", 
  "Planton", "Patrulă", 
  "Operator radio", 
  "Intervenția 1", 
  "Intervenția 2", 
  "Responsabil"
];

const reguliServicii = {
  "Ajutor OSU": [
    "lt. Bodiu Sergiu", 
    "lt. Dermindje Mihail", 
    "lt. Samoschin Anton"
  ],
  "Sergent de serviciu PCT": [
    "sg.II Plugaru Iurie", 
    "sg.III Zamaneagra Aliona", 
    "sg.III Murafa Oleg", 
    "cap. Boțoc Dumitru"
  ],
  "Planton": [
    "sold.I Tuceacov Nicolae",
    "sold.II Cucer Oxana", 
    "sold.III Roler Ira",
    "sold.II Vovc Dan"
  ],
  "Patrulă": [
    "sold.I Tuceacov Nicolae", 
    "cap. Pinzari Vladimir"
  ],
  "Operator radio": [
    "sg.III Ungureanu Andrei", 
    "sg.III Botnari Anastasia", 
    "sold.I Smirnov Silvia"
  ],
  "Intervenția 1": persoane.filter(p => p !== "Din altă subunitate"),
  "Intervenția 2": persoane.filter(p => p !== "Din altă subunitate"),

  "Responsabil": [
    "lt.col. Bordea Andrei"
  ]
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
    
    const parti = zi.split('.');
    const dataObiect = new Date(parti[2], parti[1] - 1, parti[0]);
    const numeZi = dataObiect.toLocaleDateString("ro-RO", { weekday: 'long' });
    const ziSaptamana = numeZi.charAt(0).toUpperCase() + numeZi.slice(1);

    let eticheta = "";
    if (zi === ieriStr) { card.classList.add("ieri"); eticheta = " (IERI)"; }
    else if (zi === aziStr) { card.classList.add("azi"); eticheta = " (AZI)"; }
    else if (zi === maineStr) { card.classList.add("maine"); eticheta = " (MÂINE)"; }

    card.innerHTML = `<h2>📅 ${ziSaptamana}, ${zi}${eticheta}</h2>`;

    functii.forEach((f, indexFunctie) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<span>${f}</span>`;

      const select = document.createElement("select");
      select.add(new Option("Din altă subunitate", "Din altă subunitate"));

      (reguliServicii[f] || []).forEach(p => {
        if (p !== "Din altă subunitate") select.add(new Option(p, p));
      });

      const valoareSalvata = storage?.[zi]?.[indexFunctie] || "Din altă subunitate";
      select.value = valoareSalvata;

      select.onchange = () => {
        const nouaPersoana = select.value;

        if (nouaPersoana !== "Din altă subunitate") {
          
          // 1. VERIFICARE: SĂ NU FIE DEJA ÎN ALT SERVICIU ÎN ACEEAȘI ZI
          const serviciiAzi = storage[zi] || [];
          // Verificăm dacă persoana există deja în alt index din array-ul zilei respective
          const esteDejaAzi = serviciiAzi.some((nume, idx) => nume === nouaPersoana && idx !== indexFunctie);

          if (esteDejaAzi) {
            alert(`⚠️ Eroare: ${nouaPersoana} este deja planificat(ă) la alt serviciu în această zi!`);
            select.value = valoareSalvata;
            return;
          }

          // 2. VERIFICARE: SĂ NU FIE 2 ZILE LA RÂND
          const p = zi.split('.');
          const dCurenta = new Date(p[2], p[1]-1, p[0]);
          const dIeri = new Date(dCurenta); dIeri.setDate(dIeri.getDate() - 1);
          const dMaine = new Date(dCurenta); dMaine.setDate(dMaine.getDate() + 1);
          const sIeri = dIeri.toLocaleDateString("ro-RO");
          const sMaine = dMaine.toLocaleDateString("ro-RO");

          const verificaVecini = (dataString) => {
            return storage[dataString] && Object.values(storage[dataString]).includes(nouaPersoana);
          };

          if (verificaVecini(sIeri) || verificaVecini(sMaine)) {
            alert(`⚠️ Eroare: ${nouaPersoana} este deja planificat(ă) în ziua precedentă sau următoare!`);
            select.value = valoareSalvata;
            return;
          }
        }

        // SALVARE
        if (!storage[zi]) {
          storage[zi] = new Array(functii.length).fill("Din altă subunitate");
        }
        storage[zi][indexFunctie] = nouaPersoana;
        salveaza(storage);
      };

      row.appendChild(select);
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}