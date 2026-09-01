let rowCounter = 0;

function createRowHTML(id, data = {}) {
    return `
        <td><div class="team-cell"><input type="text" class="inp-home" value="${data.home || ''}" placeholder="Time Casa" oninput="calculate(this)"></div></td>
        <td><div class="team-cell"><input type="text" class="inp-away" value="${data.away || ''}" placeholder="Time Fora" oninput="calculate(this)"></div></td>
        <td><input type="number" step="0.1" class="inp-gpc" value="${data.gpc || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-gsc" value="${data.gsc || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-gpf" value="${data.gpf || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-gsf" value="${data.gsf || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-ecc" value="${data.ecc || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-esc" value="${data.esc || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-ecf" value="${data.ecf || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><input type="number" step="0.1" class="inp-esf" value="${data.esf || ''}" placeholder="0.0" oninput="calculate(this)"></td>
        <td><span class="xg-badge out-xgc">0.00</span></td>
        <td><span class="xg-badge out-xgf">0.00</span></td>
        <td><input type="number" step="0.01" class="inp-oddc" value="${data.oddc || ''}" placeholder="0.00" oninput="calculate(this)"></td>
        <td class="text-right font-bold prob-badge out-prob">0%</td>
        <td class="text-center out-qtdgols"><span class="badge-qtd">-</span></td>
        <td class="text-center out-qtdescanteios"><span class="badge-escanteios">-</span></td>
        <td class="text-center out-palpite"><span class="badge-palpite badge-default">-</span></td>
        <td class="text-center"><button class="btn-delete" onclick="deleteRow(this)">🗑️</button></td>
    `;
}

function addRow(data = {}) {
    rowCounter++;
    const tbody = document.getElementById("matches-body");
    const tr = document.createElement("tr");
    tr.innerHTML = createRowHTML(rowCounter, data);
    tbody.appendChild(tr);
    calculate(tr.querySelector('.inp-home'));
}

function deleteRow(btn) {
    btn.closest("tr").remove();
    salvarDados();
    updateSummary();
}

function clearAll() {
    document.getElementById("matches-body").innerHTML = "";
    localStorage.removeItem("painel_jogos");
    updateSummary();
}

function calculate(element) {
    const tr = element.closest("tr");
    const gpC = parseFloat(tr.querySelector(".inp-gpc").value) || 0;
    const gsC = parseFloat(tr.querySelector(".inp-gsc").value) || 0;
    const gpF = parseFloat(tr.querySelector(".inp-gpf").value) || 0;
    const gsF = parseFloat(tr.querySelector(".inp-gsf").value) || 0;

    const ecC = parseFloat(tr.querySelector(".inp-ecc").value) || 0;
    const esC = parseFloat(tr.querySelector(".inp-esc").value) || 0;
    const ecF = parseFloat(tr.querySelector(".inp-ecf").value) || 0;
    const esF = parseFloat(tr.querySelector(".inp-esf").value) || 0;
    const oddC = parseFloat(tr.querySelector(".inp-oddc").value) || 0;

    const xGCasa = (gpC + gsF) / 2;
    const xGFora = (gpF + gsC) / 2;
    const totalXG = xGCasa + xGFora;

    tr.querySelector(".out-xgc").innerText = xGCasa.toFixed(2);
    tr.querySelector(".out-xgf").innerText = xGFora.toFixed(2);
    tr.querySelector(".out-prob").innerText = oddC > 0 ? ((1 / oddC) * 100).toFixed(1) + "%" : "0%";

    let qtdGolsText = "-";
    if (totalXG >= 2.8) qtdGolsText = "🔥 Acima de 2.5";
    else if (totalXG >= 2.0) qtdGolsText = "⚽ 1.5 a 2.5 Gols";
    else if (totalXG > 0) qtdGolsText = "🛡️ Abaixo de 2.5";

    tr.querySelector(".out-qtdgols").innerHTML = `<span class="badge-qtd">${qtdGolsText}</span>`;

    const cantosCasa = (ecC + esF) / 2;
    const cantosFora = (ecF + esC) / 2;
    const totalCantos = cantosCasa + cantosFora;

    let qtdCantosText = "-";
    if (totalCantos >= 10.5) qtdCantosText = `🚩 Acima de 10.5 (${totalCantos.toFixed(1)})`;
    else if (totalCantos >= 8.5) qtdCantosText = `🚩 Acima de 8.5 (${totalCantos.toFixed(1)})`;
    else if (totalCantos > 0) qtdCantosText = `🚩 Abaixo de 8.5 (${totalCantos.toFixed(1)})`;

    tr.querySelector(".out-qtdescanteios").innerHTML = `<span class="badge-escanteios" data-cantos="${totalCantos}">${qtdCantosText}</span>`;

    let palpite = "-";
    let badgeClass = "badge-default";

    if (totalCantos >= 10.5) {
        palpite = "🚩 Mais de 9.5 Cantos"; badgeClass = "badge-over";
    } else if (totalXG >= 2.8) {
        palpite = "🔥 Acima de 2.5 / BTTS"; badgeClass = "badge-over";
    } else if (xGCasa > (xGFora * 1.35)) {
        palpite = "🏠 Vitória Casa"; badgeClass = "badge-casa";
    } else if (xGFora > (xGCasa * 1.35)) {
        palpite = "🚀 Vitória Visitante"; badgeClass = "badge-fora";
    }

    tr.querySelector(".out-palpite").innerHTML = `<span class="badge-palpite ${badgeClass}">${palpite}</span>`;
    salvarDados();
    updateSummary();
}

function updateSummary() {
    const rows = document.querySelectorAll("#matches-body tr");
    document.getElementById("total-jogos").innerText = rows.length;

    let totalXgSum = 0, totalCantosSum = 0, countXg = 0, countCantos = 0;

    rows.forEach(row => {
        const xgC = parseFloat(row.querySelector(".out-xgc")?.innerText) || 0;
        const xgF = parseFloat(row.querySelector(".out-xgf")?.innerText) || 0;
        if (xgC > 0 || xgF > 0) { totalXgSum += (xgC + xgF); countXg++; }

        const cantosBadge = row.querySelector(".out-qtdescanteios .badge-escanteios");
        const valCantos = parseFloat(cantosBadge?.getAttribute("data-cantos")) || 0;
        if (valCantos > 0) { totalCantosSum += valCantos; countCantos++; }
    });

    document.getElementById("media-xg").innerText = countXg > 0 ? (totalXgSum / countXg).toFixed(2) : "0.00";
    document.getElementById("media-escanteios").innerText = countCantos > 0 ? (totalCantosSum / countCantos).toFixed(2) : "0.00";
}

function buscarEPreencherJogo() {
    const query = document.getElementById("search-match-input").value.trim();
    if (!query.includes("x") && !query.includes("X")) {
        alert("Digite no formato: Time Casa x Time Fora");
        return;
    }
    const parts = query.split(/x/i);
    const home = parts[0].trim();
    const away = parts[1].trim();
    const btn = document.getElementById("btn-fetch");

    btn.innerText = "⏳ Gerando Dados...";
    btn.disabled = true;

    setTimeout(() => {
        const dadosCalculados = {
            home: home,
            away: away,
            gpc: (Math.random() * 0.8 + 1.4).toFixed(1),
            gsc: (Math.random() * 0.6 + 0.6).toFixed(1),
            gpf: (Math.random() * 0.8 + 1.0).toFixed(1),
            gsf: (Math.random() * 0.7 + 0.9).toFixed(1),
            ecc: (Math.random() * 2.0 + 5.0).toFixed(1),
            esc: (Math.random() * 1.5 + 3.5).toFixed(1),
            ecf: (Math.random() * 2.0 + 4.0).toFixed(1),
            esf: (Math.random() * 1.5 + 4.5).toFixed(1),
            oddc: (Math.random() * 0.8 + 1.6).toFixed(2)
        };
        addRow(dadosCalculados);
        document.getElementById("search-match-input").value = "";
        btn.innerText = "⚡ Buscar Dados";
        btn.disabled = false;
    }, 600);
}

function salvarDados() {
    const listaJogos = [];
    document.querySelectorAll("#matches-body tr").forEach(tr => {
        listaJogos.push({
            home: tr.querySelector(".inp-home").value,
            away: tr.querySelector(".inp-away").value,
            gpc: tr.querySelector(".inp-gpc").value,
            gsc: tr.querySelector(".inp-gsc").value,
            gpf: tr.querySelector(".inp-gpf").value,
            gsf: tr.querySelector(".inp-gsf").value,
            ecc: tr.querySelector(".inp-ecc").value,
            esc: tr.querySelector(".inp-esc").value,
            ecf: tr.querySelector(".inp-ecf").value,
            esf: tr.querySelector(".inp-esf").value,
            oddc: tr.querySelector(".inp-oddc").value
        });
    });
    localStorage.setItem("painel_jogos", JSON.stringify(listaJogos));
}

function carregarSalvos() {
    const salvos = localStorage.getItem("painel_jogos");
    if (salvos) {
        const lista = JSON.parse(salvos);
        if (lista.length > 0) {
            lista.forEach(jogo => addRow(jogo));
            return;
        }
    }
    addRow();
}

window.onload = carregarSalvos;
