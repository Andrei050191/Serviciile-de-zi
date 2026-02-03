import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIGURARE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDapdObzYLSBHMzq9bJzp3CvJfKgAfao",
  authDomain: "servicii-de-zi.firebaseapp.com",
  projectId: "servicii-de-zi"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ref = doc(db, "servicii", "calendar");

const persoane = [
  "Din altă subunitate", "lt.col. Bordea Andrei", "lt. Bodiu Sergiu", "lt. Dermindje Mihail", 
  "lt. Samoschin Anton", "sg.II Plugaru Iurie", "sg.III Botnari Anastasia", "sg.III Murafa Oleg", 
  "sg.III Ungureanu Andrei", "sg.III Zamaneagra Aliona", "cap. Boțoc Dumitru", "sold.I Macovei Natalia", 
  "sold.I Răileanu Marina", "sold.I Rotari Natalia", "sold.I Smirnov Silvia", "sold.I Tuceacov Nicolae", 
  "sold.I Pinzari Vladimir", "sold.II Cucer Oxana", "sold.III Roler Ira", "sold.III Vovc Dan"
];

const functii = ["Ajutor OSU", "Sergent de serviciu PCT", "Planton", "Patrulă", "Operator radio", "Intervenția 1", "Intervenția 2"];

const reguliServicii = {
  "Ajutor OSU": ["lt.col. Bordea Andrei", "lt. Bodiu Sergiu", "lt. Dermindje Mihail", "lt. Samoschin Anton"],
  "Sergent de serviciu PCT": ["sg.II Plugaru Iurie", "sg.III Zamaneagra Aliona", "sg.III Murafa Oleg", "cap. Boțoc Dumitru", "sold.I Pinzari Vladimir"],
  "Planton": ["sold.II Cucer Oxana", "sold.III Roler Ira"],
  "Patrulă": ["sold.I Tuceacov Nicolae", "sold.III Vovc Dan"],
  "Operator radio": ["sg.III Ungureanu Andrei", "sg.III Botnari Anastasia", "sold.I Smirnov Silvia"],
  "Intervenția 1": persoane.filter(p => p !== "Din altă subunitate"),
  "Intervenția 2": persoane.filter(p => p !== "Din altă subunitate")
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

const zile = genereazaZile();
const container = document.getElementById("cards");

onSnapshot(ref, snap => {
  const data = snap.exists() ? snap.data().data || {} : {};
  randare(data);
});

async function salveaza(data) {
  try {
    await setDoc(ref, { data }, { merge: true });
  } catch (e) {
    console.error("Eroare la salvare:", e);
  }
}

function randare(storage) {
  container.innerHTML = "";
  const aziStr = new Date().toLocaleDateString("ro-RO");
  const ieriStr = new Date(Date.now() - 86400000).toLocaleDateString("ro-RO");
  const maineStr = new Date(Date.now() + 86400000).toLocaleDateString("ro-RO");

  zile.forEach(zi => {
    const card = document.createElement("div");
    card.className = "card";
    
    // Aplicare culori din CSS
    if (zi === ieriStr) card.classList.add("ieri");
    else if (zi === aziStr) card.classList.add("azi");
    else if (zi === maineStr) card.classList.add("maine");

    card.innerHTML = `<h2>📅 ${zi}</h2>`;

    functii.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<span>${f}</span>`;

      const select = document.createElement("select");
      
      // Adaugă opțiunea default
      const optDefault = new Option("Din altă subunitate", "Din altă subunitate");
      select.add(optDefault);

      // Adaugă persoanele conform regulilor
      (reguliServicii[f] || []).forEach(p => {
        if(p !== "Din altă subunitate") select.add(new Option(p, p));
      });

      select.value = storage?.[zi]?.[i] || "Din altă subunitate";

      select.onchange = () => {
        if (!storage[zi]) storage[zi] = new Array(functii.length).fill("Din altă subunitate");
        storage[zi][i] = select.value;
        salveaza(storage);
      };

      row.appendChild(select);
      card.appendChild(row);
    });
    container.appendChild(card);
  });
}