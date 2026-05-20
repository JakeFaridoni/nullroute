import { beepSound, bootSequence, clackSound, messageSound } from '../boot/boot.js';
import { tickSound, playSound } from '../boot/boot.js';
import { apiSaveGame, apiLogin, apiHandleExists, apiRegister, apiLoadSave } from '../api.js';
import { globalCompanies, localCompanies, flattenCompanies, assignIps } from './companies.js';
import { render } from '../inbox.js';
import { BGM } from '../main.js';

export const player = {
  handle: '',
  id: '',
  password: '',
  clearance: 0,
  balance: 3000,
  affiliation: 'FREELANCER',
  portfolio: {},
  inbox: [],

  tools: [
    { name: 'portScan',  level: 1, ramUsage: 120, size: 10, active: false },
    { name: 'passCrack', level: 1, ramUsage: 320, size: 15, active: false },
    { name: 'connect',   level: 1, ramUsage: 0,   size: 5,  active: false },
  ],

  installedFiles: [],

  hardware: {
    cpu: {
      name: 'KEMTEC 80486DX',
      clockSpeed: 33,
      power: 1,
    },

    ram: {
      totalRAM: 640,

      get usedRAM() {
        return player.tools
          .filter(t => t.active)
          .reduce((sum, t) => sum + t.ramUsage, 0);
      },

      get availableRAM() {
        return this.totalRAM - this.usedRAM;
      },
    },

    storage: {
      name: 'NORSTORE NS-251',
      totalSize: 80,

      get usedSize() {
        const toolsSize = player.tools.reduce((sum, t) => sum + t.size, 0);
        const filesSize = player.installedFiles.reduce((sum, f) => sum + f.size, 0);
        return toolsSize + filesSize;
      },

      get availableSize() {
        return this.totalSize - this.usedSize;
      }
    },

    bandwidth: {
      upload: 256,
      download: 512,
    },
  },

  traceBuffer: 30000,
  log: [],
};

export async function sendToInbox(item, ms = 0) {
  if (player.inbox.some(i => (i.id && i.id === item.id) || (i.title && i.title === item.title))) return;
  if ((item.type === 'nix-message' && player.handle !== 'NIX') || (item.type !== 'nix-message' && player.handle === 'NIX')) return;
  if (player.handle === 'ADMIN') return;

  if (ms) await new Promise(r => setTimeout(r, 5000));
  playSound(messageSound);
  player.inbox.push(item);
  render();
  apiSaveGame(player, sessionTargets);
}

export let sessionTargets = [];

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  date.setFullYear(1999);
  return date.toLocaleString('en-US', {
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
      <span></span>
      <span>OPERATOR REGISTRATION</span>
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

  // ID is now just a random NR-XXXX — the DB unique constraint catches
  // collisions, and we no longer have a local saves list to check against.
  function generateId() {
    return `NR-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async function failureSequence(error) {
    const steps = [
      { action: 'FLAGGING UNAUTHORISED ACCESS ATTEMPT', status: 'LOGGED' },
      { action: 'ALERTING RELAY NODE',                  status: 'DONE'   },
      { action: 'SCRUBBING SESSION DATA',               status: 'DONE'   },
      { action: 'COLLAPSING TUNNEL',                    status: 'DONE'   },
      { action: 'REVOKING CERTIFICATES',                status: 'DONE'   },
      { action: 'TERMINATING CONNECTION',               status: 'DONE'   },
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

  async function loginSequence() {
    printBlank();
    await typeLine('REJECTING NEW OPERATOR REQUEST', 'DONE');
    playSound(tickSound);
    await typeLine('REROUTING TO AUTHENTICATION NODE', 'DONE');
    playSound(tickSound);
    await new Promise(r => setTimeout(r, 1000));
    playSound(beepSound);
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
    playSound(tickSound);
    const handleInput = handle.toUpperCase();

    const { exists } = await apiHandleExists(handleInput);
    if (!exists) {
      await failureSequence('OPERATOR NOT FOUND');
      return;
    }

    const password = await promptInput('ENTER PASSWORD:', true);
    playSound(tickSound);

    const loginResult = await apiLogin(handleInput, password);
    if (!loginResult.ok) {
      await failureSequence('ACCESS DENIED. INVALID CREDENTIALS');
      return;
    }

    Object.assign(player, loginResult.player);

    // Restore session targets from the server save
    sessionTargets = loginResult.targets?.length
      ? loginResult.targets
      : assignIps(flattenCompanies(globalCompanies, localCompanies));

    printBlank();
    printLine(`WELCOME BACK, ${player.handle}`);
  }

  return new Promise(resolve => {
    const handler = async (e) => {
      playSound(clackSound);
      const key = e.key.toUpperCase();
      if (!['Y', 'N'].includes(key)) return;
      playSound(tickSound);

      document.removeEventListener('keydown', handler);

      document.getElementById('cursor').remove();
      document.getElementById('registerLine').textContent += key;

      if (key === 'N') {
        await loginSequence();
      } else {
        const handle = await promptInput('ENTER HANDLE:');
        playSound(tickSound);
        const password = await promptInput('SET PASSWORD:', true);
        playSound(tickSound);

        const { exists: handleTaken } = await apiHandleExists(handle.toUpperCase());

        if (handleTaken) {
          // Handle exists — treat as login attempt with supplied password
          const loginResult = await apiLogin(handle.toUpperCase(), password);
          if (loginResult.ok) {
            await typeLine('OPERATOR EXISTS, STARTING LOG IN', 'DONE');
            playSound(tickSound);
            Object.assign(player, loginResult.player);
            sessionTargets = loginResult.targets?.length
              ? loginResult.targets
              : assignIps(flattenCompanies(globalCompanies, localCompanies));
          } else {
            await typeLine('OPERATOR EXISTS, STARTING LOG IN', 'FAIL');
            playSound(tickSound);
            await failureSequence('ACCESS DENIED. INVALID CREDENTIALS');
            return;
          }
        } else {
          // New operator — set up player object then register
          player.handle = handle.toUpperCase();
          player.id = generateId();
          player.password = password;

          if (!Array.isArray(player.log)) player.log = [];
          player.log.push({ date: formatDate(Date.now()), type: 'REGISTRATION' });

          printBlank();
          await typeLine('VERIFYING HANDLE AVAILABILITY', 'AVAILABLE');
          playSound(tickSound);
          await typeLine('SCRUBBING REGISTRATION METADATA', 'SCRUBBED');
          playSound(tickSound);
          await typeLine('ALLOCATING ANONYMOUS RELAY NODE', 'READY');
          playSound(tickSound);
          await typeLine('BURNING REGISTRATION TRAIL', 'BURNED');
          playSound(tickSound);
          printBlank();
          printLine(`WELCOME TO NULLROUTE, ${player.handle}`);

          sessionTargets = assignIps(flattenCompanies(globalCompanies, localCompanies));

          const registerResult = await apiRegister(player.handle, player.password, player, sessionTargets);
          if (!registerResult.ok) {
            await failureSequence(`REGISTRATION FAILED: ${registerResult.reason}`);
            return;
          }

          if (!Array.isArray(player.log)) player.log = [];
          player.log.push({ date: formatDate(Date.now()), type: 'DOWNLOAD', file: 'PORTSCAN v1, PASSCRACK v1, CONNECT v1' });
        }
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

      // Final save to sync the log entries added after registration
      await apiSaveGame(player, sessionTargets);

      document.getElementById('createPrompt').remove();
      playSound(beepSound);
      await bootSequence();
      BGM.play();
      resolve();
    };

    document.addEventListener('keydown', handler);
  });
}