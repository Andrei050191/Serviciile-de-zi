import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDapdObzYLSBHMzq9bJzp3CvJfKgAfao",
  authDomain: "servicii-de-zi.firebaseapp.com",
  projectId: "servicii-de-zi"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ref = doc(db, "servicii", "calendar");

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
  // Conversie pentru a asigura formatul JSON curat înainte de trimitere
  await setDoc(ref, { data: JSON.parse(JSON.stringify(toateDatele)) }, { merge: true });
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
    
    // Inițializare structură de date sigură (Obiect în loc de Array)
    if (!storage[zi] || Array.isArray(storage[zi])) {
      const dateVechi = Array.isArray(storage[zi]) ? storage[zi] : [];
      storage[zi] = {
        oameni: dateVechi.length ? dateVechi : new Array(functii.length).fill("Din altă subunitate"),
        mod: "2"
      };
    }

    const modCurent = storage[zi].mod || "2";
    const oameniZi = storage[zi].oameni;

    const parti = zi.split('.');
    const dataObiect = new Date(parti[2], parti[1] - 1, parti[0]);
    const numeZi = dataObiect.toLocaleDateString("ro-RO", { weekday: 'long' });
    const ziSaptamana = numeZi.charAt(0).toUpperCase() + numeZi.slice(1);

    let eticheta = "";
    let culoareAccent = "#3b82f6";
    if (zi === ieriStr) { card.classList.add("ieri"); eticheta = " (IERI)"; }
    else if (zi === aziStr) { card.classList.add("azi"); eticheta = " (AZI)"; culoareAccent = "#22c55e"; }
    else if (zi === maineStr) { card.classList.add("maine"); eticheta = " (MÂINE)"; }

    card.innerHTML = `<h2>📅 ${ziSaptamana}, ${zi}${eticheta}</h2>`;

    // --- SWITCH PERSONALIZAT ---
    const switchBox = document.createElement("div");
    switchBox.className = "row";
    switchBox.style.marginBottom = "15px";
    
    switchBox.innerHTML = `
      <span style="font-family: 'Times New Roman', serif; font-weight: bold;">Echipaj Interv:</span>
      <div style="width: 55%; display: flex; background: #cbd5e1; border-radius: 8px; padding: 2px; position: relative; height: 30px; cursor: pointer; user-select: none;">
        <div style="width: 50%; text-align: center; line-height: 30px; z-index: 2; font-size: 14px; font-family: 'Times New Roman', serif; font-weight: bold; color: ${modCurent === '1' ? 'white' : '#475569'}; transition: 0.3s;">1 Pers</div>
        <div style="width: 50%; text-align: center; line-height: 30px; z-index: 2; font-size: 14px; font-family: 'Times New Roman', serif; font-weight: bold; color: ${modCurent === '2' ? 'white' : '#475569'}; transition: 0.3s;">2 Pers</div>
        <div style="position: absolute; top: 2px; left: ${modCurent === '1' ? '2px' : '50%'}; width: calc(50% - 2px); height: calc(100% - 4px); background: ${culoareAccent}; border-radius: 6px; transition: 0.3s; z-index: 1;"></div>
      </div>
    `;

    switchBox.onclick = async () => {
      const noulMod = modCurent === "2" ? "1" : "2";
      storage[zi].mod = noulMod;
      if (noulMod === "1") storage[zi].oameni[6] = "Din altă subunitate";
      await salveaza(storage);
    };
    card.appendChild(switchBox);

    functii.forEach((f, indexFunctie) => {
      if (modCurent === "1" && f === "Intervenția 2") return;

      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<span>${f}</span>`;

      const select = document.createElement("select");
      select.add(new Option("Din altă subunitate", "Din altă subunitate"));
      (reguliServicii[f] || []).forEach(p => { if (p !== "Din altă subunitate") select.add(new Option(p, p)); });

      const valoareSalvata = oameniZi[indexFunctie] || "Din altă subunitate";
      select.value = valoareSalvata;

      select.onchange = async () => {
        const nouaPersoana = select.value;
        if (nouaPersoana !== "Din altă subunitate") {
          if (oameniZi.some((nume, idx) => nume === nouaPersoana && idx !== indexFunctie)) {
            alert(`⚠️ ${nouaPersoana} are deja un serviciu azi!`);
            select.value = valoareSalvata; return;
          }
          const p = zi.split('.');
          const dC = new Date(p[2], p[1]-1, p[0]);
          const sIeri = new Date(dC.getTime() - 86400000).toLocaleDateString("ro-RO");
          const sMaine = new Date(dC.getTime() + 86400000).toLocaleDateString("ro-RO");
          
          const verificaVecini = (ds) => storage[ds] && storage[ds].oameni && storage[ds].oameni.includes(nouaPersoana);
          
          if (verificaVecini(sIeri) || verificaVecini(sMaine)) {
            alert(`⚠️ ${nouaPersoana} este planificat(ă) ieri sau mâine!`);
            select.value = valoareSalvata; return;
          }
        }
        storage[zi].oameni[indexFunctie] = nouaPersoana;
        await salveaza(storage);
      };

      row.appendChild(select);
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}