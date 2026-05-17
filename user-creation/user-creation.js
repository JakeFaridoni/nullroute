import { bootSequence } from '../boot/boot.js';

export const player = {
  handle: '',
  id: '',
  clearance: 0,
  balance: 0,
};

export async function userCreation() {

  document.body.innerHTML = `
    <div id="createPrompt">
      <span>────────────────────────────────</span>
      <span>NULLROUTE SERVICES</span>
      <span>ANONYMOUS CONTRACT BROKERAGE</span>
      <span>────────────────────────────────</span>
      <span id="registerLine">REGISTER NEW OPERATOR? (Y/N): <span id="cursor">_</span></span>
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
    const span = document.createElement('span');
    span.textContent = text;
    container.appendChild(span);
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

  player.id =  `NR-${Math.floor(1000 + Math.random() * 9000)}`;

  document.addEventListener('keydown', async (e) => {
    document.documentElement.requestFullscreen();
    playTick();
    const key = e.key.toUpperCase();
    if (!['Y', 'N'].includes(key)) return;

    document.getElementById('cursor').remove();
    document.getElementById('registerLine').textContent += key;

    if (key === 'N') {
      printBlank();
      printLine('REGISTRATION ABORTED.');
      return;
    }

    printBlank();

    const handle = await promptInput('ENTER A HANDLE:');
    player.handle = handle.toUpperCase();
    const password = await promptInput('SET PASSWORD:', true);

    printBlank();

    await typeLine('VERIFYING HANDLE AVAILABILITY', 'CLEAR');
    await typeLine('SCRUBBING REGISTRATION METADATA', 'OK');
    await typeLine('ALLOCATING ANONYMOUS RELAY NODE', 'OK');
    await typeLine('BURNING REGISTRATION TRAIL', 'OK');

    printBlank();
    printLine('────────────────────────────────');
    printLine(`OPERATOR ID:        ${player.id}`);
    printLine(`HANDLE:             ${handle.toUpperCase()}`);
    printLine('CLEARANCE:          TIER 0');
    printLine('BALANCE:            0 CR');
    printLine('RELAY NODE:         [ENCRYPTED]');
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