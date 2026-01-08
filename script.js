// --- Données de Base ---
let score = 0;
let ratePerSecond = 0;
let clickPower = 1;
let xp = 0;
let totalClicks = 0;
let totalMined = 0;

const symbols = ["💎", "💰", "⚒️", "⭐", "💣"];
const cardSuits = ['♠', '♥', '♦', '♣'];
const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const upgrades = {
    pickaxe: { cost: 50, baseRate: 1, level: 0, costMultiplier: 1.5 },
    soldier: { cost: 100, baseRate: 10, level: 0, costMultiplier: 1.2 },
    tank: { cost: 500, baseRate: 50, level: 0, costMultiplier: 1.25 },
    plane: { cost: 2000, baseRate: 200, level: 0, costMultiplier: 1.3 },
    commandCenter: { cost: 5000, baseRate: 500, level: 0, costMultiplier: 1.35 },
    militaryBase: { cost: 10000, baseRate: 1000, level: 0, costMultiplier: 1.4 }
};

// --- Initialisation du Graphique ---
const ctx = document.getElementById('statsChart').getContext('2d');
let statsChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Ressources', data: [], borderColor: '#4CAF50', fill: true }] },
    options: { responsive: true, animation: false, scales: { x: { display: false } } }
});

// --- Fonctions Système ---
function updateDisplay() {
    document.getElementById("score").textContent = Math.floor(score);
    document.getElementById("rate").textContent = ratePerSecond;
    document.getElementById("clickPwr").textContent = clickPower;
    document.getElementById("xp").textContent = xp;
    document.getElementById("xpStat").textContent = xp;
    document.getElementById("totalClicks").textContent = totalClicks;
    document.getElementById("totalMined").textContent = Math.floor(totalMined);
    document.getElementById("progress-bar").style.width = Math.min((score / 10000) * 100, 100) + "%";

    for (let key in upgrades) {
        const up = upgrades[key];
        const btn = document.getElementById(key);
        if(btn) {
            document.getElementById(`${key}Cost`).textContent = Math.round(up.cost);
            document.getElementById(`${key}Level`).textContent = up.level;
            btn.disabled = score < up.cost;
        }
    }
}

function showNotification(msg) {
    const notif = document.getElementById("notification");
    notif.textContent = msg;
    notif.classList.add("show");
    setTimeout(() => notif.classList.remove("show"), 2500);
}

// --- Logique du Clicker ---
document.getElementById("clicker").addEventListener("click", () => {
    score += clickPower;
    totalMined += clickPower;
    totalClicks++;
    xp++;
    updateDisplay();
});

function buyUpgrade(key) {
    const up = upgrades[key];
    if (score >= up.cost) {
        score -= up.cost;
        up.level++;
        if (key === "pickaxe") clickPower += up.baseRate;
        else ratePerSecond += up.baseRate;
        up.cost = Math.ceil(up.cost * up.costMultiplier);
        updateDisplay();
    }
}

Object.keys(upgrades).forEach(key => {
    const el = document.getElementById(key);
    if(el) el.addEventListener("click", () => buyUpgrade(key));
});

// Onglets
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab, .tab-content").forEach(el => el.classList.remove("active"));
        tab.classList.add("active");
        const target = document.getElementById(tab.dataset.tab);
        if(target) target.classList.add("active");
    });
});

// --- CASINO 1 : Pari Simple ---
document.getElementById("gambleButton").addEventListener("click", () => {
    const betInput = document.getElementById("betAmount");
    const bet = parseInt(betInput.value);
    const resultDisplay = document.getElementById("casinoResult");

    if (isNaN(bet) || bet <= 0 || score < bet) {
        showNotification("Mise invalide ou insuffisante !");
        return;
    }

    score -= bet;
    if (Math.random() < 0.5) {
        score += bet * 2;
        resultDisplay.textContent = "✅ GAGNÉ !";
        resultDisplay.style.color = "#4CAF50";
    } else {
        resultDisplay.textContent = "💀 PERDU !";
        resultDisplay.style.color = "#f44336";
    }
    updateDisplay();
});

// --- CASINO 2 : Machine à Sous ---
document.getElementById("slot-trigger").addEventListener("click", () => {
    const bet = 500;
    if (score < bet) { showNotification("Pas assez de ressources !"); return; }

    score -= bet;
    const slots = [document.getElementById("slot1"), document.getElementById("slot2"), document.getElementById("slot3")];
    slots.forEach(s => s.classList.add("spinning"));

    setTimeout(() => {
        slots.forEach(s => s.classList.remove("spinning"));
        const results = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        slots[0].textContent = results[0];
        slots[1].textContent = results[1];
        slots[2].textContent = results[2];

        if (results[0] === results[1] && results[1] === results[2]) {
            score += bet * 20;
            showNotification("🎰 JACKPOT x20 !");
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            score += bet * 2;
            showNotification("✨ Paire ! x2");
        }
        updateDisplay();
    }, 600);
});

// --- CASINO 3 : Blackjack ---
let playerHand = [], dealerHand = [];
const bjBet = 1000;

function generateCard() {
    const valueStr = cardValues[Math.floor(Math.random() * cardValues.length)];
    const suit = cardSuits[Math.floor(Math.random() * cardSuits.length)];
    let points = parseInt(valueStr);
    if (['J', 'Q', 'K'].includes(valueStr)) points = 10;
    if (valueStr === 'A') points = 11;
    const isRed = (suit === '♥' || suit === '♦');
    return { display: valueStr + suit, value: points, isAce: (valueStr === 'A'), red: isRed };
}

function calculateHandTotal(hand) {
    let total = hand.reduce((sum, card) => sum + card.value, 0);
    let aceCount = hand.filter(card => card.isAce).length;
    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }
    return total;
}

function renderCardHTML(card, hidden = false) {
    if (hidden) return `<div class="card back">?</div>`;
    const colorClass = card.red ? 'red-card' : '';
    return `<div class="card ${colorClass}">${card.display}</div>`;
}

document.getElementById("bj-start").addEventListener("click", () => {
    if (score < bjBet) { showNotification("Pas assez de ressources !"); return; }
    score -= bjBet;
    playerHand = [generateCard(), generateCard()];
    dealerHand = [generateCard()];
    document.getElementById("bj-board").style.display = "block";
    document.getElementById("bj-actions").style.display = "block";
    document.getElementById("bj-start").style.display = "none";
    document.getElementById("bj-result").textContent = "";
    updateBJDisplay(true);
    updateDisplay();
});

document.getElementById("bj-hit").addEventListener("click", () => {
    playerHand.push(generateCard());
    if (calculateHandTotal(playerHand) > 21) {
        endBJ("DÉPASSÉ ! Perdu.");
    }
    updateBJDisplay(true);
});

document.getElementById("bj-stay").addEventListener("click", () => {
    while (calculateHandTotal(dealerHand) < 17) {
        dealerHand.push(generateCard());
    }
    const pTotal = calculateHandTotal(playerHand);
    const dTotal = calculateHandTotal(dealerHand);
    if (dTotal > 21 || pTotal > dTotal) {
        score += bjBet * 2;
        endBJ(`GAGNÉ ! La banque a ${dTotal}.`);
    } else if (pTotal === dTotal) {
        score += bjBet;
        endBJ("ÉGALITÉ !");
    } else {
        endBJ(`PERDU ! La banque a ${dTotal}.`);
    }
});

function updateBJDisplay(hideDealer = false) {
    document.getElementById("player-hand").innerHTML = playerHand.map(c => renderCardHTML(c)).join("");
    document.getElementById("player-score").textContent = calculateHandTotal(playerHand);
    let dealerHTML = dealerHand.map(c => renderCardHTML(c)).join("");
    if (hideDealer) dealerHTML += renderCardHTML({}, true);
    document.getElementById("dealer-hand").innerHTML = dealerHTML;
    document.getElementById("dealer-score").textContent = calculateHandTotal(dealerHand);
}

function endBJ(msg) {
    updateBJDisplay(false);
    document.getElementById("bj-result").textContent = msg;
    document.getElementById("bj-actions").style.display = "none";
    document.getElementById("bj-start").style.display = "inline-block";
    document.getElementById("bj-start").textContent = "Rejouer";
    updateDisplay();
}

// --- CASINO 4 : Roue de la Fortune ---
let isSpinning = false;
const wheelCost = 1000;
const wheelPrizes = [
    { name: "PERDU", mult: 0 }, { name: "x2", mult: 2 }, 
    { name: "x0.5", mult: 0.5 }, { name: "JACKPOT x10", mult: 10 },
    { name: "PERDU", mult: 0 }, { name: "x1.5", mult: 1.5 }, 
    { name: "x5", mult: 5 }, { name: "REJOUER", mult: 1 }
];

document.getElementById("wheel-spin").addEventListener("click", () => {
    if (isSpinning || score < wheelCost) {
        if (score < wheelCost) showNotification("Fonds insuffisants !");
        return;
    }

    isSpinning = true;
    score -= wheelCost;
    updateDisplay();

    const wheel = document.getElementById("wheel");
    const resultText = document.getElementById("wheel-result");
    const deg = Math.floor(5000 + Math.random() * 5000); // Grand nombre pour plusieurs tours
    
    wheel.style.transform = `rotate(${deg}deg)`;
    resultText.textContent = "La roue tourne...";

    setTimeout(() => {
        isSpinning = false;
        const actualDeg = deg % 360;
        const prizeIndex = Math.floor(((360 - actualDeg) % 360) / 45);
        const prize = wheelPrizes[prizeIndex];
        
        const gain = wheelCost * prize.mult;
        score += gain;
        
        resultText.textContent = prize.mult > 0 ? `Résultat : ${prize.name} (+${gain})` : `Résultat : ${prize.name}`;
        resultText.style.color = prize.mult >= 1 ? "#4CAF50" : "#f44336";
        updateDisplay();
    }, 4000);
});

// --- Boucle de jeu et Sauvegarde ---
setInterval(() => {
    score += ratePerSecond;
    totalMined += ratePerSecond;
    updateDisplay();
    if (statsChart) {
        statsChart.data.labels.push("");
        statsChart.data.datasets[0].data.push(score);
        if(statsChart.data.labels.length > 15) {
            statsChart.data.labels.shift();
            statsChart.data.datasets[0].data.shift();
        }
        statsChart.update();
    }
}, 1000);

document.getElementById("saveGameButton").addEventListener("click", () => {
    const save = { score, totalMined, totalClicks, xp, clickPower, ratePerSecond, upgrades };
    localStorage.setItem("ng_clicker_save", JSON.stringify(save));
    showNotification("Partie sauvegardée !");
});

document.getElementById("resetGameButton").addEventListener("click", () => {
    if(confirm("Tout supprimer ?")) { localStorage.removeItem("ng_clicker_save"); location.reload(); }
});

window.onload = () => {
    const saved = JSON.parse(localStorage.getItem("ng_clicker_save"));
    if (saved) {
        score = saved.score; totalMined = saved.totalMined; totalClicks = saved.totalClicks;
        xp = saved.xp; clickPower = saved.clickPower; ratePerSecond = saved.ratePerSecond;
        if(saved.upgrades) Object.assign(upgrades, saved.upgrades);
    }
    updateDisplay();
};
