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
  "Din altă subunitate", "lt.col. Bordea Andrei", "lt. Bodiu Sergiu", "lt. Dermindje Mihail", 
  "lt. Samoschin Anton", "sg.II Plugaru Iurie", "sg.III Botnari Anastasia", "sg.III Murafa Oleg", 
  "sg.III Ungureanu Andrei", "sg.III Zamaneagra Aliona", "sg.III Boțoc Dumitru", "sold.I Răileanu Marina", 
  "sold.I Rotari Natalia", "sold.I Smirnov Silvia", "sold.I Tuceacov Nicolae", "cap. Pinzari Vladimir", 
  "sold.II Cucer Oxana", "sold.II Vovc Dan", "sold.III Roler Ira" 
];

const functii = ["Ajutor OSU", "Sergent de serviciu PCT", "Planton", "Patrulă", "Operator radio", "Intervenția 1", "Intervenția 2", "Responsabil"];

const reguliServicii = {
  "Ajutor OSU": ["lt. Bodiu Sergiu", "lt. Dermindje Mihail", "lt. Samoschin Anton"],
  "Sergent de serviciu PCT": ["sg.II Plugaru Iurie", "sg.III Zamaneagra Aliona", "sg.III Murafa Oleg", "sg.III Boțoc Dumitru"],
  "Planton": ["sold.I Tuceacov Nicolae", "sold.II Cucer Oxana", "sold.III Roler Ira", "sold.II Vovc Dan"],
  "Patrulă": ["sold.I Tuceacov Nicolae", "cap. Pinzari Vladimir"],
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
    
    const parti = zi.split('.');
    const dataObiect = new Date(parti[2], parti[1] - 1, parti[0]);
    const numeZi = dataObiect.toLocaleDateString("ro-RO", { weekday: 'long' });
    const ziSaptamana = numeZi.charAt(0).toUpperCase() + numeZi.slice(1);

    let eticheta = "";
    if (zi === ieriStr) { card.classList.add("ieri"); eticheta = " (IERI)"; }
    else if (zi === aziStr) { card.classList.add("azi"); eticheta = " (AZI)"; }
    else if (zi === maineStr) { card.classList.add("maine"); eticheta = " (MÂINE)"; }

    card.innerHTML = `<h2>📅 ${ziSaptamana}, ${zi}${eticheta}</h2>`;

    // --- LOGICA SWITCH MOD ---
    const modInterventie = storage[zi]?.mod || "2"; 
    const switchBox = document.createElement("div");
    switchBox.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; cursor: pointer; user-select: none;";
    switchBox.innerHTML = `
      <span style="font-size: 13px; color: #475569; font-weight: bold;">Echipaj Intervenție:</span>
      <div style="display: flex; background: #cbd5e1; border-radius: 20px; padding: 2px; position: relative; width: 90px; height: 26px;">
        <div style="width: 50%; text-align: center; font-size: 11px; z-index: 2; line-height: 26px; color: ${modInterventie === '1' ? 'white' : '#475569'}; transition: 0.3s; font-weight: bold;">1</div>
        <div style="width: 50%; text-align: center; font-size: 11px; z-index: 2; line-height: 26px; color: ${modInterventie === '2' ? 'white' : '#475569'}; transition: 0.3s; font-weight: bold;">2</div>
        <div style="position: absolute; top: 2px; left: ${modInterventie === '1' ? '2px' : '44px'}; width: 44px; height: 22px; background: #3b82f6; border-radius: 18px; transition: 0.3s; z-index: 1;"></div>
      </div>
    `;

    switchBox.onclick = async () => {
      if (!storage[zi]) {
        storage[zi] = new Array(functii.length).fill("Din altă subunitate");
      }
      const noulMod = modInterventie === "2" ? "1" : "2";
      storage[zi].mod = noulMod;
      
      // Dacă e mod 1, forțăm Intervenția 2 să fie resetată
      if (noulMod === "1") {
        storage[zi][6] = "Din altă subunitate";
      }
      
      await salveaza(storage);
    };
    card.appendChild(switchBox);

    // --- RANDARE FUNCTII ---
    functii.forEach((f, indexFunctie) => {
      if (modInterventie === "1" && f === "Intervenția 2") return;

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

      select.onchange = async () => {
        const nouaPersoana = select.value;

        if (nouaPersoana !== "Din altă subunitate") {
          const serviciiAzi = storage[zi] || [];
          const esteDejaAzi = serviciiAzi.some((nume, idx) => nume === nouaPersoana && idx !== indexFunctie);
          if (esteDejaAzi) {
            alert(`⚠️ Eroare: ${nouaPersoana} este deja planificat(ă) azi!`);
            select.value = valoareSalvata;
            return;
          }

          const p = zi.split('.');
          const dCurenta = new Date(p[2], p[1]-1, p[0]);
          const dIeri = new Date(dCurenta); dIeri.setDate(dIeri.getDate() - 1);
          const dMaine = new Date(dCurenta); dMaine.setDate(dMaine.getDate() + 1);
          const sIeri = dIeri.toLocaleDateString("ro-RO");
          const sMaine = dMaine.toLocaleDateString("ro-RO");

          const verificaVecini = (dataString) => storage[dataString] && Object.values(storage[dataString]).includes(nouaPersoana);

          if (verificaVecini(sIeri) || verificaVecini(sMaine)) {
            alert(`⚠️ Eroare: ${nouaPersoana} este deja planificat(ă) ieri sau mâine!`);
            select.value = valoareSalvata;
            return;
          }
        }

        if (!storage[zi]) storage[zi] = new Array(functii.length).fill("Din altă subunitate");
        storage[zi][indexFunctie] = nouaPersoana;
        await salveaza(storage);
      };

      row.appendChild(select);
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}