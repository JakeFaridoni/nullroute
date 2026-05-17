import { getLines } from './lines.js';

export function getMaxLines(container) {
  const li = container.firstChild;
  if (!li) return 20;
  const lineHeight = li.getBoundingClientRect().height;
  return Math.floor(window.innerHeight / lineHeight) - 2;
}

export const tickSound = new Audio('./assets/audio/tick.mp3');
export function playSound(sound) {
  const click = sound.cloneNode();
  click.volume = 0.5;
  click.play();
}

export const clackSound = new Audio('./assets/audio/clack.mp3');

export async function bootSequence() {
  const lines = getLines();
  
  const ul = document.createElement('ul');
  ul.id = 'boot';
  document.body.appendChild(ul);
  const container = ul;

  for (const line of lines) {
    const pre = document.createElement('pre');
    container.appendChild(pre);

    while (container.children.length > getMaxLines(container)) {
      container.removeChild(container.firstChild);
    }

    if (!line.text && !line.dots) {
      pre.innerHTML = '&nbsp;';
      continue;
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = line.text;
    pre.appendChild(textSpan);
    playSound(tickSound);

    if (line.dots) {
      const dotsSpan = document.createElement('span');
      pre.appendChild(dotsSpan);
      await typeDots(dotsSpan);
    }

    if (line.value) {
      pre.innerHTML += `<span class="ok">  ${line.value}</span>`;
    } else if (line.ok) {
      pre.innerHTML += '<span class="ok">  [ OK ]</span>';
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
