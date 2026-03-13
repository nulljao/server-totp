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
      // add a copy button after the secret
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      // use inline SVG for a clipboard icon
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
      copyBtn.title = 'Copiar segredo';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.secret).then(() => {
          copyBtn.innerHTML = '&#x2714;'; // checkmark
          setTimeout(() => { copyBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`; }, 1000);
        }).catch(err => {
          console.error('Erro ao copiar:', err);
        });
      });
      div.appendChild(copyBtn);

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
