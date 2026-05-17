export async function titleScreen() {
  document.body.innerHTML = `<div id="title"></div>`;
  const container = document.getElementById('title');

  const lines = [
  { text: 'INITIALISING SECURE CHANNEL', dots: true, ok: true },
  { text: 'ROUTING THROUGH PROXY NODES', dots: true, ok: true },
  { text: 'ENCRYPTING HANDSHAKE', dots: true, ok: true },
  { text: 'SOURCE', dots: true, value: '[ ENCRYPTED ]' },
  { text: 'DESTINATION', dots: true, value: '[ ENCRYPTED ]' },
  { text: '' },
  { text: 'CONNECTION', dots: true, value: '[ ESTABLISHED ]' },
  { text: '' },
  { text: '███╗   ██╗██╗   ██╗██╗     ██╗     ██████╗  ██████╗ ██╗   ██╗████████╗███████╗' },
  { text: '████╗  ██║██║   ██║██║     ██║     ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝' },
  { text: '██╔██╗ ██║██║   ██║██║     ██║     ██████╔╝██║   ██║██║   ██║   ██║   █████╗  ' },
  { text: '██║╚██╗██║██║   ██║██║     ██║     ██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ' },
  { text: '██║ ╚████║╚██████╔╝███████╗███████╗██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗' },
  { text: '╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝' },
  { text: '' },
  { text: '                     [ ANONYMOUS CONTRACT BROKER ]' },
  { text: '                 [ NO NAMES, NO TRAILS, NO QUESTIONS ]' },
  { text: '' },
  { text: '' },
];

for (const line of lines) {
  const pre = document.createElement('pre');
  container.appendChild(pre);

  if (!line.text) {
    pre.innerHTML = '&nbsp;';
    continue;
  }

  pre.textContent = line.text;

  if (line.dots) {
    const dotsSpan = document.createElement('span');
    pre.appendChild(dotsSpan);
    await new Promise(resolve => {
      const tw = new Typewriter(dotsSpan, { delay: 50, cursor: '' });
      tw.typeString('...').callFunction(resolve).start();
    });

    if (line.value) {
      pre.innerHTML += `<span class="ok">  ${line.value}</span>`;
    } else if (line.ok) {
      pre.innerHTML += '<span class="ok">  [ OK ]</span>';
    }
  }
}

  const prompt = document.createElement('pre');
  prompt.innerHTML = '                  PRESS ANY KEY TO ACCEPT CONNECTION<span id="cursor">_</span>';
  container.appendChild(prompt);

  await new Promise(resolve => {
    document.addEventListener('keydown', (e) => {
      document.documentElement.requestFullscreen();
      resolve();
    }, { once: true });
  });
}