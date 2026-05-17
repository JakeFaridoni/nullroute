import { getLines } from './lines.js';

const container = document.getElementById('boot');

const MAX_LINES = 40;

const tickSound = new Audio('./assets/audio/tick.mp3');

export async function bootSequence() {
  const lines = getLines();
  
  const ul = document.createElement('ul');
  ul.id = 'boot';
  document.body.appendChild(ul);
  const container = ul;

  for (const line of lines) {
    const li = document.createElement('li');
    container.appendChild(li);

    while (container.children.length > MAX_LINES) {
      container.removeChild(container.firstChild);
    }

    if (!line.text && !line.dots) {
      li.innerHTML = '&nbsp;';
      continue;
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = line.text;
    li.appendChild(textSpan);
    playTick();

    if (line.dots) {
      const dotsSpan = document.createElement('span');
      li.appendChild(dotsSpan);
      await typeDots(dotsSpan);
    }

    if (line.value) {
      li.innerHTML += `<span class="ok">  ${line.value}</span>`;
    } else if (line.ok) {
      li.innerHTML += '<span class="ok">  [ OK ]</span>';
    }
  }
}

function typeDots(el) {
  return new Promise(resolve => {
    const tw = new Typewriter(el, { delay: 10, cursor: '' });
    tw.typeString('...')
      .callFunction(resolve)
      .start();
  });
}

function playTick() {
  const click = tickSound.cloneNode();
  click.volume = 0.5;
  click.play();
}