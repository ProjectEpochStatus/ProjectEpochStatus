const servers = {
  "Login-Server": { host: "198.244.165.233", port: 3724 },
  "Kezan":        { host: "198.244.165.233", port: 8085 },
  "Gurubashi":    { host: "198.244.165.233", port: 8086 }
};

let serverStates = {};

function getTimeString() {
  return new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
}

function updateTable() {
  const tbody = document.querySelector("#status-table tbody");
  tbody.innerHTML = "";

  Object.entries(serverStates).forEach(([name, state]) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${name}</td>
      <td class="${state.online ? "online" : "offline"}">${state.online ? "🟢 Online" : "🔴 Offline"}</td>
      <td class="${state.lastOnline === null ? "" : (state.lastOnline ? "online" : "offline")}">
        ${state.lastOnline === null ? "—" : (state.lastOnline ? "🟢 Online" : "🔴 Offline")}
      </td>
      <td>${state.lastChange || "—"}</td>
    `;

    tbody.appendChild(row);
  });
}

async function checkServer(host, port) {
	const url = `https://cors-anywhere.herokuapp.com/https://portchecker.io/api/${host}/${port}`;

  console.log(url);  // Should output actual URL like https://portchecker.io/api/198.244.165.233/3724
  try {
    const res = await fetch(url);
    const data = await res.json();
	console.log("API response data:", data);
    return data.status === "open";
  } catch (e) {
    return false;
  }
}

async function pollServers() {
  for (const [name, { host, port }] of Object.entries(servers)) {
    const previous = serverStates[name]?.online ?? null;
    const current = await checkServer(host, port);

    if (!serverStates[name]) {
      serverStates[name] = {
        online: current,
        lastOnline: null,
        lastChange: getTimeString()
      };
    } else if (current !== previous) {
      serverStates[name].lastOnline = previous;
      serverStates[name].lastChange = getTimeString();
      serverStates[name].online = current;
    }
  }

  updateTable();
}

// Initial call and repeat every 15s
pollServers();
setInterval(pollServers, 15000);
