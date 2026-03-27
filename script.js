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

// abrir modal
function openModalCntr() {
  console.log("Abriendo modal de cuenta...");
  document.getElementById("modalCuenta").style.display = "flex";
}
// cerrar modal
function cerrarModal() {
  document.getElementById("modalCuenta").style.display = "none";
}

// validar y crear cuenta
async function crearCuenta() {
  const device = document.getElementById("regDevice").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPass").value.trim();
  const pass2 = document.getElementById("regPass2").value.trim();

  if (!device || !email || !pass || !pass2) {
    mostrarError("Todos los campos son obligatorios");
    return;
  }

  if (pass !== pass2) {
    mostrarError("Las contraseñas no coinciden");
    return;
  }

  try {
    // 🔐 1. Crear usuario
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass,
    );

    const uid = userCredential.user.uid;

    console.log("Usuario creado:", uid);

    // 🗄️ 2. Crear estructura en DB
    await set(ref(db, "devices/" + device), {
      ownerUid: uid,
      controls: {
        electricFence: false,
        sonicAlarm: false,
      },
      status: "offline",
      events: {},
    });

    showToast("Cuenta creada", "Dispositivo vinculado", "success");

    cerrarModal();
  } catch (error) {
    console.error(error);

    mostrarError(error.message);
  }
}

// reutilizamos tu fancy alert
function mostrarError(msg) {
  document.getElementById("fancyText").innerText = msg;
  document.getElementById("fancyAlert").style.display = "flex";
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
  //En esta linea invoco al console para que pueda imprimir el error en caso de que no se actualice el estado del control, esto es para depuración y no debería afectar la funcionalidad de la app
  console.log("Control toggled:", name, checkbox.checked);
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
