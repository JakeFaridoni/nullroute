import { bootSequence } from '../boot/boot.js';

export const player = {
  handle: '',
  id: '',
  password: '',
  clearance: 0,
  balance: 3000,
  affiliation: 'FREELANCER',
  tools: [],
};

function savePlayer(player) {
  const players = loadPlayers();
  players[player.handle] = player;
  localStorage.setItem('nullroute_players', JSON.stringify(players));
}

function loadPlayers() {
  const data = localStorage.getItem('nullroute_players');
  return data ? JSON.parse(data) : {};
}

function findPlayer(handle) {
  return loadPlayers()[handle.toUpperCase()] || null;
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

  const tickSound = new Audio('./assets/audio/tick.mp3');

  function playTick() {
    const click = tickSound.cloneNode();
    click.volume = 0.5;
    click.play();
  }

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
        if (!['Shift', 'Control'].includes(e.key)) playTick();
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
    const players = loadPlayers();
    const usedIds = Object.values(players).map(p => p.id);
    let id;
    do {
      id = `NR-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (usedIds.includes(id));
    return id;
  }

  document.addEventListener('keydown', async (e) => {
    playTick();
    const key = e.key.toUpperCase();
    if (!['Y', 'N'].includes(key)) return;

    document.getElementById('cursor').remove();
    document.getElementById('registerLine').textContent += key;

    if (key === 'N') {
      printBlank();
      const handle = await promptInput('ENTER HANDLE:');
      const existing = findPlayer(handle.toUpperCase());

      if (!existing) {
        printBlank();
        printLine('OPERATOR NOT FOUND.');
        return;
      }

      const password = await promptInput('ENTER PASSWORD:', true);

      if (password !== existing.password) {
        printBlank();
        printLine('ACCESS DENIED. INVALID CREDENTIALS.');
        return;
      }

      player.handle = existing.handle;
      player.id = existing.id;
      player.password = existing.password;
      player.clearance = existing.clearance;
      player.balance = existing.balance;
      player.affiliation = existing.affiliation;

    } else {
      const handle = await promptInput('ENTER HANDLE:');
      const existing = findPlayer(handle.toUpperCase());
      const password = await promptInput('SET PASSWORD:', true);
      if(existing && existing.password === password) {
        typeLine('OPERATOR EXISTS, OVERWRITING', 'DONE');
      } else {
        printLine('ACCESS DENIED. INVALID CREDENTIALS.');
        return;
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

      savePlayer(player);
    }

    printBlank();

    printLine(`WELCOME TO NULLROUTE, ${player.handle}`);

    printBlank();
    printLine('────────────────────────────────');
    printLine(`ID:                ${player.id}`);
    printLine(`HANDLE:            ${player.handle}`);
    printLine(`CLEARANCE:         TIER ${player.clearance}`);
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

    document.getElementById('createPrompt').remove();
    console.log(player);
    await bootSequence();
  }, { once: true });
}