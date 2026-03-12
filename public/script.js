async function loadCodes() {
  try {
    const res = await fetch('/codes');
    const data = await res.json();

    const container = document.getElementById('codes');
    container.innerHTML = '';

    for (const name in data) {
      const item = data[name];

      const div = document.createElement('div');
      div.className = 'item';

      div.innerHTML = `
        <strong>${name}</strong><br>
        Código: ${item.code}<br>
        Secret: <span class="secret">${item.secret}</span>
      `;

      container.appendChild(div);
    }
  } catch (err) {
    document.getElementById('codes').innerHTML = 'Erro ao carregar códigos';
  }
}

// -----------------------------
// SINCRONIZAÇÃO DO TIMER TOTP
// -----------------------------
function startTotpTimer() {
  function updateTimer() {
    const now = Math.floor(Date.now() / 1000);
    const remaining = 30 - (now % 30);

    document.getElementById('timer').textContent = remaining;

    // Quando chegar a zero, recarrega os códigos
    if (remaining === 30) {
      loadCodes();
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Carrega os códigos imediatamente
loadCodes();

// Inicia o timer sincronizado
startTotpTimer();
