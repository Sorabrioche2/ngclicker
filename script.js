let score = 0;
let ratePerSecond = 0;
let clickPower = 1;
let xp = 0;
let totalClicks = 0;
let totalMined = 0;

const upgrades = {
    pickaxe: { cost: 50, baseRate: 1, count: 0, level: 0, costMultiplier: 1.5 },
    soldier: { cost: 100, baseRate: 10, count: 0, level: 0, costMultiplier: 1.2 },
    tank: { cost: 500, baseRate: 50, count: 0, level: 0, costMultiplier: 1.25 },
    plane: { cost: 2000, baseRate: 200, count: 0, level: 0, costMultiplier: 1.3 }, // Virgule ajoutée ici
    commandCenter: { cost: 5000, baseRate: 500, count: 0, level: 0, costMultiplier: 1.35 },
    militaryBase: { cost: 10000, baseRate: 1000, count: 0, level: 0, costMultiplier: 1.4 } // Virgule supprimée ici (optionnel mais propre)
};

const ACHIEVEMENT_GOALS = [
    { id: 1, name: "Débutant", condition: () => totalMined >= 1000, awarded: false, description: "Miner 1000 Ressources." },
    { id: 2, name: "Clavier Chaud", condition: () => totalClicks >= 50, awarded: false, description: "Cliquer 50 fois." }
];

const scoreDisplay = document.getElementById("score");
const rateDisplay = document.getElementById("rate");
const clickPowerDisplay = document.getElementById("clickPwr");
const xpDisplay = document.getElementById("xp");
const progressBar = document.getElementById("progress-bar");
const achievementsList = document.getElementById("achievementsList");

const ctx = document.getElementById('statsChart').getContext('2d');
let statsChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Ressources', data: [], borderColor: '#4CAF50', fill: true }] },
    options: { responsive: true, scales: { x: { display: false } } }
});

function updateDisplay() {
    scoreDisplay.textContent = Math.floor(score);
    rateDisplay.textContent = ratePerSecond;
    clickPowerDisplay.textContent = clickPower;
    xpDisplay.textContent = xp;
    document.getElementById("xpStat").textContent = xp;
    document.getElementById("totalClicks").textContent = totalClicks;
    document.getElementById("totalMined").textContent = Math.floor(totalMined);
    
    progressBar.style.width = Math.min((score / 10000) * 100, 100) + "%";

    for (let key in upgrades) {
        const up = upgrades[key];
        document.getElementById(`${key}Cost`).textContent = Math.round(up.cost);
        document.getElementById(`${key}Level`).textContent = up.level;
        document.getElementById(key).disabled = score < up.cost;
    }
    checkAchievements();
}

function showNotification(msg) {
    const notif = document.getElementById("notification");
    notif.textContent = msg;
    notif.classList.add("show");
    setTimeout(() => notif.classList.remove("show"), 2500);
}

function checkAchievements() {
    ACHIEVEMENT_GOALS.forEach(ach => {
        if (!ach.awarded && ach.condition()) {
            ach.awarded = true;
            showNotification(`🏆 Succès : ${ach.name}`);
            const li = document.createElement("li");
            li.textContent = `${ach.name} : ${ach.description}`;
            achievementsList.appendChild(li);
        }
    });
}

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
    document.getElementById(key).addEventListener("click", () => buyUpgrade(key));
});

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab, .tab-content").forEach(el => el.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

setInterval(() => {
    score += ratePerSecond;
    totalMined += ratePerSecond;
    updateDisplay();
    
    statsChart.data.labels.push("");
    statsChart.data.datasets[0].data.push(score);
    if(statsChart.data.labels.length > 15) {
        statsChart.data.labels.shift();
        statsChart.data.datasets[0].data.shift();
    }
    statsChart.update();
}, 1000);

document.getElementById("saveGameButton").addEventListener("click", () => {
    const save = { score, totalMined, totalClicks, xp, clickPower, ratePerSecond, upgrades };
    localStorage.setItem("ng_clicker_save", JSON.stringify(save));
    showNotification("Partie sauvegardée !");
});

function loadGame() {
    const saved = JSON.parse(localStorage.getItem("ng_clicker_save"));
    if (saved) {
        score = saved.score;
        totalMined = saved.totalMined;
        totalClicks = saved.totalClicks;
        xp = saved.xp;
        clickPower = saved.clickPower;
        ratePerSecond = saved.ratePerSecond;
        Object.assign(upgrades, saved.upgrades);
        updateDisplay();
    }
}

window.onload = loadGame;


window.onload = loadGame;

