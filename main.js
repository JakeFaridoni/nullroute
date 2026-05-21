import { titleScreen } from './titlescreen.js';
import { formatDate, userCreation, player, sessionTargets, sendToInbox } from './user-creation.js';
import { generateContracts, startContractRefresh } from './contracts.js';

import { initTerminal } from './terminal.js';
import { initInbox } from './inbox.js';
import { welcome, init, helloworld, spam } from './messages.js';

export const ambientNoise = new Audio('./assets/audio/ambient-noise.mp3');
export const BGM = new Audio('./assets/audio/BGM.mp3');

ambientNoise.loop = true;
BGM.loop = true;

// ===[ STARTUP & LOGIN ]=================================

await titleScreen();
await userCreation();

document.body.innerHTML = `
<div id="app">
<div id="panel-terminal">
<div class="panel-header">[ TERMINAL ]</div>
<div class="panel-content" id="terminal-content"></div>
</div>
<div id="panel-right">
<div id="panel-tracker">
<div class="panel-header">[ IP TRACKER ]</div>
<div class="panel-content" id="tracker-content"></div>
</div>
<div id="panel-inbox">
<div class="panel-header">[ INBOX ]</div>
<div class="panel-content" id="inbox-content"></div>
</div>
</div>
</div>
<div id="statusbar">
<span id="status-time"></span> 
<span id="status-handle"></span>
<span id="status-id"></span>
<span id="status-clearance"></span>
<span id="status-balance"></span>
<span id="status-connection">CONNECTION: NONE</span>
</div>
`;

// ===[ STATUSES ]========================================

const clock = document.getElementById('status-time');
clock.textContent = `${formatDate(Date.now())}`;
setInterval(() => {
    clock.textContent = `${formatDate(Date.now())}`;
}, 1000);

const statusHandle = document.getElementById('status-handle');
statusHandle.textContent = `HAND: ${player.handle}`;

const statusId = document.getElementById('status-id');
statusId.textContent = `ID: ${player.id}`;

const statusClearance = document.getElementById('status-clearance');
statusClearance.textContent = `CLEAR: TIER ${player.clearance}`;

export const statusBalance = document.getElementById('status-balance');

export const statusConnection = document.getElementById('status-connection');
statusBalance.textContent = `BAL: ${player.balance}CR`;


// ===[ CURSOR ]==========================================

const cursor = document.createElement('div');
cursor.id = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.clientX + 'px';
    trail.style.top = e.clientY + 'px';
    document.body.appendChild(trail);

    setTimeout(() => trail.remove(), 300);
});

// ===[ INITIALIZATION ]==================================

initTerminal(document.getElementById('terminal-content'));
initInbox(document.getElementById('inbox-content'));

// ===[ INTRO MESSAGES ]==================================

await sendToInbox(welcome, 5000);
await sendToInbox(init, 5000);
await sendToInbox(helloworld, 30000);

// ===[ SPAM MESSAGES ]===================================

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(() => {
    if (random(0, 500) === 4) sendToInbox(spam[random(0, spam.length - 1)]);
}, 10000);

// ===[ CONTRACTS ]=======================================

generateContracts(sessionTargets);
startContractRefresh(sessionTargets);