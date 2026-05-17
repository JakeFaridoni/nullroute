
import { bootSequence, clackSound } from '../boot/boot.js';
import { tickSound, playSound } from '../boot/boot.js';
import { saveGame, loadSave, loadSaves, verifyPassword } from '../saves.js';
import { targets, assignIps } from '../company-names/companies.js';

export const player = {
  handle: '', // Unique player handle, allows for multiple saves. Used to log back in. If you forget it you lose your save, remember it
  id: '', // Unique player ID, allows for multiple saves
  password: '', // Password used to log back in. If you forget it you lose your save, remember it
  clearance: 0, // NULLROUTE clearance, higher number = more stuff, harder missions, more money
  balance: 3000, // Balance of the player in credits, starts at 3000
  affiliation: 'FREELANCER', // Changes based on player choice, starts at freelancer

  tools: [
    // Each tool has a name, level 1-5, ram usage in K, file size in MB, and active state (true/false)
    // Starting tools
    { name: 'portScan', level: 1, ramUsage: 120, size: 10, active: false },
    { name: 'passCrack', level: 1, ramUsage: 320, size: 15, active: false },
    { name: 'connect', level: 1, ramUsage: 0, size: 5, active: false },

    // Purchasable tools
  ],

  // Each file has a name and size, in MB
  installedFiles: [
    { name: 'test-file', size: 3 },
  ],

  hardware: {
    // Starting hardware
    cpu: {
      name: 'KEMTEC 80486DX',
      clockSpeed: 33, // Clock speed, in MHZ
      power: 1,
    },

    // RAM, in K
    ram: {
      totalRAM: 640,

      get usedRAM() {
        return player.tools
          .filter(t => t.active)
          .reduce((sum, t) => sum + t.ramUsage, 0);
      },

      get availableRAM() {
        return this.totalRAM - this.usedRAM
      },
    },

    storage: {
      name: 'NORSTORE NS-251',
      totalSize: 80, // Size, in MB

      get usedSize() { // Size,  in MB
        const toolsSize = player.tools.reduce((sum, t) => sum + t.size, 0);
        const filesSize = player.installedFiles.reduce((sum, f) => sum + f.size, 0);
        return toolsSize + filesSize;
      },

      get availableSize() { // Size, in MB
        return this.totalSize - this.usedSize;
      }
    },

    bandwidth: {
      upload: 256, // Speed, in KB/s
      download: 512, // Speed in KB/s
    },
  },

  traceBuffer: 30000, // Time before game over while hacking, in milliseconds

  log: [], // Used for progression and player reference.
};

export let sessionTargets = [];

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}




export async function userCreation() {

  document.body.innerHTML = `
    <div id="createPrompt">
      <span>────────────────────────────────</span>
      <span>NULLROUTE SERVICES</span>
      <span>ANONYMOUS CONTRACT BROKERAGE</span>
      <span>────────────────────────────────</span>
      <span id="registerLine">REGISTER AS NEW OPERATOR? (Y/N): <span id="cursor">_</span></span>
    </div>
      `;

  const container = document.getElementById('createPrompt');

  function printLine(text) {
    const pre = document.createElement('pre');
    pre.textContent = text;
    container.appendChild(pre);
  }

  function printBlank() {
    const span = document.createElement('span');
    span.innerHTML = '&nbsp;';
    container.appendChild(span);
  }

  function typeLine(text, status) {
    return new Promise(resolve => {
      const span = document.createElement('span');
      container.appendChild(span);

      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      span.appendChild(textSpan);

      const dotsSpan = document.createElement('span');
      span.appendChild(dotsSpan);

      const tw = new Typewriter(dotsSpan, { delay: 30, cursor: '' });
      tw.typeString('...')
        .callFunction(() => {
          span.innerHTML += `<span class="ok">  [ ${status} ]</span>`;
          resolve();
        })
        .start();
    });
  }

  function promptInput(promptText, masked = false) {
    return new Promise(resolve => {
      const span = document.createElement('span');
      span.textContent = promptText + ' ';
      container.appendChild(span);

      const cursor = document.createElement('span');
      cursor.textContent = '_';
      cursor.id = 'cursor';
      span.appendChild(cursor);
      let value = '';

      const handler = (e) => {
        if (!['Shift', 'Control'].includes(e.key)) playSound(clackSound);
        if (e.key === 'Enter' && value.length > 0) {
          cursor.remove();
          document.removeEventListener('keydown', handler);
          resolve(value);
        } else if (e.key === 'Backspace') {
          value = value.slice(0, -1);
          cursor.remove();
          span.textContent = promptText + ' ' + (masked ? '*'.repeat(value.length) : value);
          span.appendChild(cursor);
        } else if (e.key.length === 1) {
          value += e.key.toUpperCase();
          cursor.remove();
          span.textContent = promptText + ' ' + (masked ? '*'.repeat(value.length) : value);
          span.appendChild(cursor);
        }
      };

      document.addEventListener('keydown', handler);
    });
  }

  function generateId() {
    const saves = loadSaves();
    const usedIds = Object.values(saves).map(s => s.player.id);
    let id;
    do {
      id = `NR-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (usedIds.includes(id));
    return id;
  }

  async function failureSequence(error) {
    const steps = [
      { action: 'FLAGGING UNAUTHORISED ACCESS ATTEMPT', status: 'LOGGED' },
      { action: 'ALERTING RELAY NODE', status: 'DONE' },
      { action: 'SCRUBBING SESSION DATA', status: 'DONE' },
      { action: 'COLLAPSING TUNNEL', status: 'DONE' },
      { action: 'REVOKING CERTIFICATES', status: 'DONE' },
      { action: 'TERMINATING CONNECTION', status: 'DONE' },
    ];

    printBlank();
    printLine(error);
    printBlank();
    for (const { action, status } of steps) {
      await typeLine(action, status);
    }
    printBlank();
    printLine('CONNECTION TERMINATED.');
    printBlank();
    await new Promise(r => setTimeout(r, 2000));
    window.location.reload();
  }

  document.addEventListener('keydown', async (e) => {
    playSound(clackSound);
    const key = e.key.toUpperCase();
    if (!['Y', 'N'].includes(key)) return;

    document.getElementById('cursor').remove();
    document.getElementById('registerLine').textContent += key;

    if (key === 'N') {
      printBlank();
      await typeLine('REJECTING NEW OPERATOR REQUEST', 'DONE');
      await typeLine('REROUTING TO AUTHENTICATION NODE', 'DONE');
      await new Promise(r => setTimeout(r, 1000));
      container.innerHTML = '';
      printBlank();
      printLine('────────────────────────────────');
      printLine('NULLROUTE SERVICES');
      printLine('ANONYMOUS CONTRACT BROKERAGE');
      printBlank();
      printLine('NULLROUTE AUTH NODE');
      printLine('OPERATOR LOG IN');
      printLine('────────────────────────────────');
      printBlank();
      const handle = await promptInput('ENTER HANDLE:');
      const save = loadSave(handle.toUpperCase());

      if (!save) {
        await failureSequence('OPERATOR NOT FOUND');
        return;
      }

      const existing = save.player;
      const password = await promptInput('ENTER PASSWORD:', true);

      if (!await verifyPassword(password, existing.password)) {
        if (!await verifyPassword(password, existing.password)) {
          await failureSequence('ACCESS DENIED. INVALID CREDENTIALS');
          return;
        }
      }

      Object.assign(player, existing);

      printBlank();

      printLine(`WELCOME BACK, ${player.handle}`);

    } else {
      const handle = await promptInput('ENTER HANDLE:');
      const existingSave = loadSave(handle.toUpperCase());
      const existing = existingSave ? existingSave.player : null;
      const password = await promptInput('SET PASSWORD:', true);
      if (existing) {
        if (await verifyPassword(password, existing.password)) {
          await typeLine('OPERATOR EXISTS, OVERWRITING', 'DONE');
        } else {
          await typeLine('OPERATOR EXISTS, OVERWRITING', 'FAIL');
          await failureSequence('ACCESS DENIED. INVALID CREDENTIALS');
        }
      }
      player.handle = handle.toUpperCase();
      player.id = generateId();
      player.password = password;

      printBlank();

      await typeLine('VERIFYING HANDLE AVAILABILITY', 'AVAILABLE');
      await typeLine('SCRUBBING REGISTRATION METADATA', 'SCRUBBED');
      await typeLine('ALLOCATING ANONYMOUS RELAY NODE', 'READY');
      await typeLine('BURNING REGISTRATION TRAIL', 'BURNED');
      await typeLine('CONFIRMING OPERATOR INFORMATION', 'CONFIRMED');

      sessionTargets = assignIps(targets);
      await saveGame(player, sessionTargets);

      printBlank();

      printLine(`WELCOME TO NULLROUTE, ${player.handle}`);

      if (!Array.isArray(player.log)) player.log = [];
      player.log.push({ date: formatDate(Date.now()), type: 'DOWNLOAD', file: 'PORTSCAN v1, PASSCRACK v1, CONNECT v1' });
    }

    printBlank();
    printLine('────────────────────────────────');
    printLine(`ID:                ${player.id}`);
    printLine(`HANDLE:            ${player.handle}`);
    printLine(`CLEARANCE:         TIER ${player.clearance}`);
    printLine(`AFFILIATION:       ${player.affiliation}`);
    printLine(`BALANCE:           ${player.balance} CR`);
    printLine('RELAY NODE:        [ ENCRYPTED ]');
    printLine('────────────────────────────────');
    printBlank();

    await new Promise(resolve => {
      const span = document.createElement('span');
      span.textContent = 'PRESS ANY KEY TO START RELAY NODE. ';
      container.appendChild(span);

      const cursor = document.createElement('span');
      cursor.textContent = '_';
      cursor.id = 'cursor';
      cursor.style.animation = 'blink 0.7s step-end infinite';
      span.appendChild(cursor);

      document.addEventListener('keydown', resolve, { once: true });
    });

    if (!Array.isArray(player.log)) player.log = [];
    player.log.push({ date: formatDate(Date.now()), type: 'LOG IN' });

    const save = loadSave(player.handle);
    sessionTargets = save ? save.targets : assignIps(targets);
    await saveGame(player, sessionTargets);

    document.getElementById('createPrompt').remove();
    await bootSequence();
  }, { once: true });
}