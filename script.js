let lastSeen = 0;
let deviceId = null;
document.addEventListener("DOMContentLoaded", () => {
  //iniciarStatusListener(deviceId);
});

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
}
updateClock();
setInterval(updateClock, 1000);

function fancyMessageBox(message) {
  document.getElementById("fancyText").innerText = message;
  document.getElementById("fancyAlert").style.display = "flex";
}

function closeFancy() {
  document.getElementById("fancyAlert").style.display = "none";
}

// Login
async function login() {
  if (false) {
    document.getElementById("loginScreen").classList.remove("active");
    document.getElementById("mainScreen").classList.add("active");
    showTab("controles", null, true);
    return;
  }
  try {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passInput").value;
    if (!email || !password) {
      showToast(
        "Campos incompletos",
        "Por favor, completa todos los campos.",
        "warning",
      );
      return;
    }
    const userCredential = await window.signInWithEmailAndPassword(
      window.auth,
      email,
      password,
    );

    const uid = userCredential.user.uid;
    console.log("Usuario autenticado:", uid);
    deviceId = await checkUserDevice(uid);
    console.log("ID de dispositivo obtenido:", deviceId);
    if (!deviceId) {
      openRegisterDeviceModal(); // Mostrar modal
      return;
    }
    //console.log("Dispositivo registrado para este usuario:", deviceId);
    // Si sí existe:
    window.currentDeviceId = deviceId;

    initControlsListener();
    initActivityListener();
    // iniciarStatusListener(deviceId);

    document.getElementById("loginScreen").classList.remove("active");
    document.getElementById("mainScreen").classList.add("active");
    showTab("controles", null, true);
    document.getElementById("DeviceName").textContent =
      "Dispositivo: " + deviceId;
    document.getElementById("statusText").textContent = "Cargando estado...";
    document.getElementById("configDevice").placeholder = deviceId;
  } catch (error) {
    console.error("Error:", error.message);
    //fancyMessageBox("Credenciales incorrectas papu 🔐");
    showToast(
      "Error de inicio de sesión",
      "Verifica tus credenciales",
      "warning",
    );
  }
}

function iniciarStatusListener(deviceId) {
  const statusRef = window.ref(window.db, `devices/${deviceId}/status`);
  const badge = document.getElementById("statusBadge");
  const text = document.getElementById("statusText");

  let timer = null;

  function setOnline() {
    badge.classList.remove("offline");
    text.textContent = "En línea";
  }

  function setOffline() {
    badge.classList.add("offline");
    text.textContent = "Desconectado";
  }

  window.onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (!data?.lastSeen) return;

    // Llegó un cambio → online
    setOnline();

    // Reiniciamos el timer cada vez que cambia
    clearTimeout(timer);
    timer = setTimeout(setOffline, 15000); // ajusta según frecuencia del dispositivo
  });
}

function logout() {
  document.getElementById("emailInput").value = "";
  document.getElementById("passInput").value = "";
  document.getElementById("mainScreen").classList.remove("active");
  document.getElementById("loginScreen").classList.add("active");
}

//Modal para abrir modal para registrar dispositivo
function openRegisterDeviceModal() {
  Swal.fire({
    title: "Registrar dispositivo",
    input: "text",
    inputLabel: "Ingrese el ID del dispositivo (ej: DSI-27843C)",
    inputPlaceholder: "DSI-XXXXXX",
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonText: "Registrar",
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value) {
        return "Debe ingresar un ID";
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      registerDevice(result.value);
    }
  });
}

//Función para registrar el dispositivo en Firebase
async function registerDevice(deviceId) {
  const db = window.db;
  const uid = window.auth.currentUser.uid;

  const deviceRef = window.ref(db, "devices/" + deviceId);
  const snapshot = await window.get(deviceRef);

  // 🔴 Si ya existe y pertenece a otro usuario
  if (snapshot.exists()) {
    const data = snapshot.val();

    if (data.ownerUid && data.ownerUid !== uid) {
      Swal.fire(
        "Error",
        "Este dispositivo ya está registrado por otro usuario.",
        "error",
      );
      return;
    }
  }

  // 🟢 Crear o actualizar dispositivo
  await window.set(deviceRef, {
    ownerUid: uid,
    controls: {
      electricFence: false,
      sonicAlarm: false,
    },
    status: {
      online: false,
      lastSeen: Date.now(),
    },
    events: {},
  });

  window.currentDeviceId = deviceId;

  Swal.fire("Éxito", "Dispositivo registrado correctamente", "success");

  initControlsListener();
  initActivityListener();

  document.getElementById("loginScreen").classList.remove("active");
  document.getElementById("mainScreen").classList.add("active");
  showTab("controles", null, true);
}

async function checkUserDevice(uid) {
  // console.log("Verificando dispositivo para usuario:", uid);

  const devicesRef = ref(window.db, "devices");
  const deviceQuery = query(devicesRef, orderByChild("ownerUid"), equalTo(uid));
  //console.log("Ejecutando consulta:", deviceQuery);
  const snapshot = await get(deviceQuery);
  //console.log("Snapshot obtenido:", snapshot.val());
  if (snapshot.exists()) {
    //console.log("Dispositivo registrado para este usuario.");
    let device = null;

    snapshot.forEach((child) => {
      device = child.key; // Este es el DSI-XXXX
    });

    //console.log("Dispositivo encontrado:", device);
    return device;
  } else {
    //console.log("No hay dispositivo registrado");
    return null;
  }
}

//Funcion para cargar los datos iniciales de los controles
function initControlsListener() {
  //console.log("Inicializando listener de controles...");

  const controlsRef = window.ref(
    db,
    "devices/" + window.currentDeviceId + "/controls",
  );

  window.onValue(controlsRef, (snapshot) => {
    // console.log("Datos de controles actualizados:", snapshot.val());
    const data = snapshot.val();
    // console.log("Datos recibidos:", data);
    if (!data) return;
    console.log(
      "Estado actual - Cerca:",
      data.electricFence,
      "Alarma:",
      data.sonicAlarm,
    );
    // Actualizar switches
    document.getElementById("toggle-cerca").checked = data.electricFence;
    document.getElementById("toggle-alarma").checked = data.sonicAlarm;

    updateCardState(
      "cerca",
      document.getElementById("card-cerca"),
      data.electricFence,
    );
    updateCardState(
      "alarma",
      document.getElementById("card-alarma"),
      data.sonicAlarm,
    );
  });
}

//Funcion para cargar los datos de actividad
function initActivityListener() {
  const eventsRef = window.ref(
    db,
    "devices/" + window.currentDeviceId + "/events",
  );

  window.onValue(eventsRef, (snapshot) => {
    const container = document.getElementById("actividad");
    container.innerHTML = '<div class="section-label">Últimos eventos</div>';

    const data = snapshot.val();
    if (!data) return;

    const eventsArray = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.timestamp - a.timestamp);

    eventsArray.forEach((event) => {
      const date = new Date(event.timestamp);
      const formatted = date.toLocaleString();

      container.innerHTML += `
        <div class="config-row">
          <div>
            <div class="config-row-label">${event.message}</div>
            <div class="config-row-sub">${formatted}</div>
          </div>
        </div>
      `;
    });
  });
}

// Tabs
function showTab(tabName, clickedBtn, fromNav) {
  // Hide all tabs
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active-content"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active-tab"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  // Show selected
  document.getElementById(tabName).classList.add("active-content");

  // Sync top tabs and bottom nav
  const tabOrder = ["controles", "actividad", "config"];
  const idx = tabOrder.indexOf(tabName);

  document.querySelectorAll(".tab-btn")[idx]?.classList.add("active-tab");
  document.querySelectorAll(".nav-item")[idx]?.classList.add("active");
}

async function toggleControl(name) {
  const checkbox = document.getElementById("toggle-" + name);
  const card = document.getElementById("card-" + name);

  checkbox.checked = !checkbox.checked;
  updateCardState(name, card, checkbox.checked);

  // console.log("Toggle desde card:", name, checkbox.checked);

  deviceId = window.currentDeviceId;

  if (!deviceId) {
    //  console.error("No hay deviceId cargado");
    return;
  }

  const field = name === "cerca" ? "electricFence" : "sonicAlarm";

  // 🔥 ACTUALIZAR CONTROL EN EL DEVICE CORRECTO
  await window.set(
    window.ref(window.db, "devices/" + deviceId + "/controls/" + field),
    checkbox.checked,
  );

  // 🔥 GUARDAR EVENTO DENTRO DEL DEVICE
  const eventRef = window.ref(window.db, "devices/" + deviceId + "/events");

  await window.push(eventRef, {
    type: field + (checkbox.checked ? "_on" : "_off"),
    timestamp: Date.now(),
    source: "app",
    message: checkbox.checked
      ? field === "electricFence"
        ? "Cerca activada desde app"
        : "Alarma activada desde app"
      : field === "electricFence"
        ? "Cerca desactivada desde app"
        : "Alarma desactivada desde app",
  });

  //  console.log("Estado actualizado correctamente");
}

function updateCardState(name, card, isActive) {
  const desc = document.getElementById("desc-" + name);
  const labels = {
    cerca: {
      on: { title: "✓ Perímetro activo", cls: "active-state" },
      off: { title: "Activar perímetro de seguridad", cls: "" },
    },
    alarma: {
      on: { title: "⚠ Alarma activada", cls: "danger-state" },
      off: { title: "Activar sirena de emergencia", cls: "" },
    },
  };

  card.className =
    "control-card " + (isActive ? labels[name].on.cls : labels[name].off.cls);
  desc.textContent = isActive ? labels[name].on.title : labels[name].off.title;

  const messages = {
    cerca: {
      on: {
        title: "Cerca activada",
        desc: "Perímetro eléctrico activo",
        type: "success",
      },
      off: {
        title: "Cerca desactivada",
        desc: "Perímetro desactivado",
        type: "warning",
      },
    },
    alarma: {
      on: {
        title: "Alarma activada",
        desc: "Sirena de emergencia activa",
        type: "warning",
      },
      off: {
        title: "Alarma desactivada",
        desc: "Sistema silenciado",
        type: "success",
      },
    },
  };

  const msg = messages[name][isActive ? "on" : "off"];
  showToast(msg.title, msg.desc, msg.type);
}

function showToast(title, desc, type) {
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toastIcon");
  const toastTitle = document.getElementById("toastTitle");
  const toastDesc = document.getElementById("toastDesc");

  toastTitle.textContent = title;
  toastDesc.textContent = desc;
  toastIcon.className =
    "toast-icon " + (type === "success" ? "success" : "warning");
  toastIcon.innerHTML =
    type === "success"
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>';

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
