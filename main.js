import { targets } from './companies.js';
import { titleScreen } from './titlescreen.js';
import { formatDate, userCreation, player, sessionTargets, sendToInbox } from './user-creation.js';
import { generateContracts, startContractRefresh } from './contracts.js';

import { initTerminal } from './terminal.js';
import { initInbox, render } from './inbox.js';
import { beepSound, playSound } from './boot/boot.js';
import { welcome, initContract, friend, spam, nixReportAshOne, nixReportEmberOne, nixMessageIgnis } from './story.js';

export const ambientNoise = new Audio('./assets/audio/ambient-noise.mp3');
export const BGM = new Audio('./assets/audio/BGM.mp3');

ambientNoise.loop = true;
BGM.loop = true;

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

const statusBalance = document.getElementById('status-balance');

export const statusConnection = document.getElementById('status-connection');
statusBalance.textContent = `BAL: ${player.balance}CR`;

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

initTerminal(document.getElementById('terminal-content'));
initInbox(document.getElementById('inbox-content'));

await sendToInbox(nixReportAshOne, 2000);
await sendToInbox(nixReportEmberOne, 500);
await sendToInbox(nixMessageIgnis, 500);
await sendToInbox(welcome, 5000);
await sendToInbox(initContract, 5000);
await sendToInbox(friend, 30000);

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(() => {
    if (random(0, 100) === 58) sendToInbox(spam[random(0, spam.length - 1)]);
}, 10000);

generateContracts(sessionTargets);
startContractRefresh(sessionTargets);