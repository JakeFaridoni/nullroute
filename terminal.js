import { player, sessionTargets } from './user-creation.js';
import { beepSound, clackSound, playSound } from './boot/boot.js';
import { contractBoard, acceptContract } from './contracts.js';
import { statusConnection, statusBalance } from './main.js';
import { apiGetStocks, apiBuyStock, apiSellStock, apiSaveGame, apiGetLeaderboard, apiChangePassword, apiDeleteAccount } from './api.js';

let connectedTo = null;

const history = [];       // command history
let historyIndex = -1;    // current position when cycling with arrow keys
let inputLocked = false;  // locked during async command execution

let container;            // the panel-content div passed in from main.js
let inputLine;            // the always-present bottom input row
let inputValueSpan;       // the span showing what the user is typing
let cursorSpan;           // the blinking underscore
let inputValue = '';      // current input buffer

export function initTerminal(el) {
    container = el;

    // build the input line, always sits at the bottom of the panel
    inputLine = document.createElement('pre');
    inputLine.id = 'terminal-input-line';

    const prompt = document.createElement('span');
    prompt.id = 'terminal-prompt';
    prompt.textContent = `${player.handle}@${player.id} > `;

    inputValueSpan = document.createElement('span');
    inputValueSpan.id = 'terminal-input-value';

    cursorSpan = document.createElement('span');
    cursorSpan.id = 'cursor';
    cursorSpan.textContent = '_';

    inputLine.appendChild(prompt);
    inputLine.appendChild(inputValueSpan);
    inputLine.appendChild(cursorSpan);
    container.appendChild(inputLine);

    // print a welcome line
    print('NULLROUTE TERMINAL READY.');
    printBlank();
    print('TYPE \'HELP\' FOR COMMANDS.');
    printBlank();

    // global keydown listener
    document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
    if (inputLocked) return;

    if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
        playSound(clackSound);
    }

    if (e.key === 'Enter') {
        if (inputValue.trim().length === 0) return;
        submitCommand(inputValue.trim());

    } else if (e.key === 'Backspace') {
        inputValue = inputValue.slice(0, -1);
        updateInputDisplay();

    } else if (e.key === 'ArrowUp') {
        e.preventDefault(); // stop page scroll
        if (history.length === 0) return;
        historyIndex = Math.min(historyIndex + 1, history.length - 1);
        inputValue = history[historyIndex];
        updateInputDisplay();

    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        historyIndex = Math.max(historyIndex - 1, -1);
        inputValue = historyIndex === -1 ? '' : history[historyIndex];
        updateInputDisplay();

    } else if (e.key.length === 1) {
        inputValue += e.key.toUpperCase();
        updateInputDisplay();
    }
}

function updateInputDisplay() {
    inputValueSpan.textContent = inputValue;
    // keep cursor after the text
    cursorSpan.remove();
    inputLine.appendChild(cursorSpan);
    scrollToBottom();
}

// ── COMMAND SUBMISSION ────────────────────────────────

async function submitCommand(raw) {
    inputLocked = true;

    // push to history, reset index
    history.unshift(raw);
    historyIndex = -1;

    // echo the command back into output
    printPromptLine(raw);

    // clear input
    inputValue = '';
    updateInputDisplay();

    // parse and dispatch
    const [cmd, ...args] = raw.split(' ').filter(Boolean);
    await dispatch(cmd.toLowerCase(), args);

    inputLocked = false;
    scrollToBottom();
}

function printPromptLine(raw) {
    const pre = document.createElement('pre');
    pre.textContent = `${player.handle}@${player.id} > ${raw}`;
    // insert before the input line so it appears above it
    container.insertBefore(pre, inputLine);

    scrollToBottom();
}

// ── DISPATCH ─────────────────────────────────────────

async function dispatch(cmd, args) {
    const handler = commands[cmd];
    if (handler) {
        await handler(args);
    } else {
        print(`UNKNOWN COMMAND: ${cmd.toUpperCase()}.`);
        print(`TYPE 'HELP' FOR A LIST OF COMMANDS.`);
    }
}

// ── PRINT HELPERS ─────────────────────────────────────

export function print(text) {
    const pre = document.createElement('pre');
    pre.textContent = text;
    container.insertBefore(pre, inputLine);

    scrollToBottom();
}

export function printBlank() {
    const pre = document.createElement('pre');
    pre.innerHTML = '&nbsp;';
    container.insertBefore(pre, inputLine);

    scrollToBottom();
}

function typeLine(text) {
    return new Promise(resolve => {
        const pre = document.createElement('pre');
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        const dotsSpan = document.createElement('span');
        pre.appendChild(textSpan);
        pre.appendChild(dotsSpan);
        container.insertBefore(pre, inputLine);


        const tw = new Typewriter(dotsSpan, { delay: 30, cursor: '' });
        tw.typeString('...').callFunction(resolve).start();
        scrollToBottom();
    });
}

function clearTerminal() {
    terminalContent.forEach(line => {
        line.remove();
    });
}

function scrollToBottom() {
    container.scrollTop = container.scrollHeight;
}

// ── COMMAND REGISTRY ──────────────────────────────────

const commands = {
    help: cmdHelp,
    clear: cmdClear,
    status: cmdStatus,
    tools: cmdTools,
    log: cmdLog,
    whoami: cmdWhoami,
    exit: cmdExit,
    connect: cmdConnect,
    disconnect: cmdDisconnect,
    accept: cmdAccept,
};

// ── COMMANDS ──────────────────────────────────────────

async function cmdConnect(args) {
    if (connectedTo) {
        print(`ALREADY CONNECTED TO ${connectedTo}. DISCONNECT FIRST.`);
        return;
    }

    const target = args[0]?.toUpperCase();
    if (!target) {
        print('USAGE: CONNECT [NULLROUTE | STOCKMARKET | IP]');
        return;
    }

    if (target === 'NULLROUTE') {
        await connectNullroute();
        return;
    }

    if (target === 'STOCKMARKET') {
        await connectStockMarket();
        return;
    }

    print('USAGE: CONNECT [NULLROUTE | STOCKMARKET | IP]');
}
cmdConnect.description = 'CONNECT TO A HOST.';

async function cmdDisconnect() {
    if (!connectedTo) {
        print('NOT CONNECTED TO ANY HOST.');
        return;
    }

    const wasConnected = connectedTo;
    connectedTo = null;

    if (wasConnected === 'NULLROUTE') {
        setNullrouteMode(false);
        printBlank();
        await typeLine('CLOSING SECURE CHANNEL');
        await typeLine('SCRUBBING SESSION DATA');
        cmdClear();
        printBlank();
        print('DISCONNECTED FROM NULLROUTE.');
        printBlank();
        statusConnection.textContent = 'CONNECTION: NONE';
        return;
    }

    if (wasConnected === 'STOCKMARKET') {
        setStockMarketMode(false);
        printBlank();
        await typeLine('CLOSING MARKET CONNECTION');
        cmdClear();
        printBlank();
        print('DISCONNECTED FROM STOCK MARKET.');
        printBlank();
        statusConnection.textContent = 'CONNECTION: NONE';
        return;
    }
}
cmdDisconnect.description = 'DISCONNECT FROM HOST.';

function cmdHelp() {
    printBlank();
    print('AVAILABLE COMMANDS:');
    printBlank();
    for (const [name, fn] of Object.entries(commands)) {
        print(`  ${name.toUpperCase().padEnd(16)}${fn.description ?? ''}`);
        printBlank();
    }
}
cmdHelp.description = 'LIST COMMANDS.';

async function cmdExit() {
    printBlank();
    await typeLine('LOGGING OUT');
    await new Promise(r => setTimeout(r, 1500));
    playSound(beepSound);
    await new Promise(r => setTimeout(r, 500));
    window.location.reload();
}
cmdExit.description = 'EXIT THE CURRENT SESSION.';

function cmdClear() {
    while (container.firstChild !== inputLine) {
        container.removeChild(container.firstChild);
    }
}
cmdClear.description = 'CLEAR THE TERMINAL.';

function cmdWhoami() {
    printBlank();
    print(`HANDLE:      ${player.handle}`);
    print(`ID:          ${player.id}`);
    print(`CLEARANCE:   TIER ${player.clearance}`);
    print(`AFFILIATION: ${player.affiliation}`);
    print(`BALANCE:     ${player.balance} CR`);
    printBlank();
}
cmdWhoami.description = 'DISPLAY OPERATOR INFO.';

function cmdStatus() {
    const ram = player.hardware.ram;
    const storage = player.hardware.storage;
    const bw = player.hardware.bandwidth;

    printBlank();
    print('SYSTEM STATUS');
    printBlank();
    print(`CPU:       ${player.hardware.cpu.name} @ ${player.hardware.cpu.clockSpeed}MHZ`);
    printBlank();
    print(`RAM:       ${ram.usedRAM}K / ${ram.totalRAM}K USED`);
    print(`           ${ram.availableRAM}K AVAILABLE`);
    printBlank();
    print(`STORAGE:   ${storage.name}`);
    print(`           ${storage.usedSize}MB / ${storage.totalSize}MB USED`);
    print(`           ${storage.availableSize}MB AVAILABLE`);
    printBlank();
    print(`BANDWIDTH: UP   ${bw.upload} KB/S`);
    print(`           DOWN ${bw.download} KB/S`);
    printBlank();
    print(`TRACE:     ${(player.traceBuffer / 1000).toFixed(0)}S`);
    printBlank();
}
cmdStatus.description = 'DISPLAY SYSTEM HARDWARE.';

function cmdTools() {
    printBlank();
    print('INSTALLED TOOLS:');
    printBlank();

    if (player.tools.length === 0) {
        print('  NO TOOLS INSTALLED.');
        printBlank();
        return;
    }

    print(`  ${'NAME'.padEnd(16)}${'LVL'.padEnd(8)}${'RAM'.padEnd(12)}${'SIZE'.padEnd(10)}STATUS`);
    printBlank();

    for (const tool of player.tools) {
        const name = tool.name.toUpperCase().padEnd(16);
        const level = `LVL ${tool.level}`.padEnd(8);
        const ram = `${tool.ramUsage}K`.padEnd(12);
        const size = `${tool.size}MB`.padEnd(10);
        const status = tool.active ? 'ACTIVE' : 'INACTIVE';
        print(`  ${name}${level}${ram}${size}${status}`);
    }

    printBlank();
    print(`  ${player.tools.length} TOOL(S) INSTALLED.`);
    printBlank();
}
cmdTools.description = 'LIST INSTALLED TOOLS.';

function cmdLog(args) {
    const pageSize = 10;
    const page = parseInt(args[0]) || 1;
    const total = player.log.length;

    if (total === 0) {
        print('NO LOG ENTRIES FOUND.');
        return;
    }

    const totalPages = Math.ceil(total / pageSize);
    const clampedPage = Math.min(Math.max(page, 1), totalPages);
    const start = (clampedPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const entries = player.log.slice(start, end);

    printBlank();
    print(`SYSTEM LOG  —  PAGE ${clampedPage}/${totalPages}`);
    printBlank();

    for (const entry of entries) {
        print(`  ${entry.date}  ${entry.type.padEnd(14)}`);
    }

    printBlank();

    if (totalPages > 1) {
        print(`  USE 'LOG [PAGE]' TO NAVIGATE. SHOWING ${start + 1}-${end} OF ${total}.`);
        printBlank();
    }
}
cmdLog.description = 'VIEW SYSTEM LOG.';

async function cmdAccept(args) {
    if (connectedTo !== 'NULLROUTE') {
        print('NOT CONNECTED TO NULLROUTE.');
        return;
    }

    const id = args[0]?.toUpperCase();
    if (!id) {
        print('USAGE: ACCEPT [CONTRACT ID]');
        return;
    }

    const result = await acceptContract(id, sessionTargets);

    printBlank();
    if (!result.ok) {
        print(`FAILED: ${result.reason}`);
        return;
    }

    const c = result.contract;
    printBlank();
    print(`CONTRACT ${c.id} ACCEPTED.`);
    printBlank();
    print(`TARGET:    ${c.target}`);
    print(`OBJECTIVE: ${c.objective} — ${c.description}`);
    print(`PAYOUT:    ${c.payout.toLocaleString()} CR`);
    print(`SECURITY:  MON ${c.security.monitor}  PRX ${c.security.proxy}  FW ${c.security.firewall}`);
    printBlank();
    print('CONTRACT DETAILS SENT TO INBOX.');
    printBlank();
}
cmdAccept.description = 'ACCEPT A CONTRACT.';

// ── NULLROUTE ─────────────────────────────────────────

let _fullCommands = null;
let _nullroutePage = 'menu';

async function connectNullroute() {
    connectedTo = 'NULLROUTE';

    printBlank();
    await typeLine('ROUTING TO NULLROUTE SERVICES');
    await typeLine('AUTHENTICATING OPERATOR');
    await typeLine('ESTABLISHING SECURE CHANNEL');
    printBlank();

    setNullrouteMode(true, 'menu');
    await printNullrouteMenu();

    statusConnection.textContent = 'CONNECTION: NULLROUTE';
}

async function printNullrouteMenu() {
    _nullroutePage = 'menu';
    setNullrouteMode(true, 'menu');

    cmdClear();
    printBlank();
    print('NULLROUTE SERVICES');
    printBlank();
    print('  NEWS          GLOBAL NETWORK ACTIVITY');
    printBlank();
    print('  CONTRACTS     AVAILABLE CONTRACT BOARD');
    printBlank();
    print('  SOFTWARE      SOFTWARE MARKETPLACE');
    printBlank();
    print('  HARDWARE      HARDWARE MARKETPLACE');
    printBlank();
    print('  OPERATORS     OPERATOR LEADERBOARD');
    printBlank();
    print('  NODE          YOUR OPERATOR PROFILE');
    printBlank();
    print('  DISCONNECT    DISCONNECT FROM NULLROUTE');
    printBlank();
}

function printNewsBoard() {
    _nullroutePage = 'news';
    setNullrouteMode(true, 'news');

    cmdClear();
    printBlank();
    print('NULLROUTE // NETWORK NEWS');
    printBlank();
    print('  NO EVENTS RECORDED.');
    printBlank();
    print('  BACK    RETURN TO MENU');
    printBlank();
}

function printContractBoard() {
    _nullroutePage = 'contracts';
    setNullrouteMode(true, 'contracts');

    cmdClear();
    printBlank();
    print('NULLROUTE // CONTRACT BOARD');
    printBlank();

    if (contractBoard.length === 0) {
        print('  NO CONTRACTS AVAILABLE.');
        printBlank();
    } else {
        print(`  ${'ID'.padEnd(12)}${'OBJECTIVE'.padEnd(14)}${'DIFFICULTY'.padEnd(12)}PAYOUT`);
        printBlank();

        for (const c of contractBoard) {
            if (c.status === 'EXPIRED') continue;

            if (c.difficulty > player.clearance) {
                print(`  ${'██████████'.padEnd(12)}${'██████████'.padEnd(14)}${'██'.padEnd(12)}██████`);
                printBlank();
                continue;
            }

            const id = c.id.padEnd(12);
            const objective = c.objective.padEnd(14);
            const difficulty = `TIER ${c.difficulty}`.padEnd(12);
            const payout = `${c.payout.toLocaleString()} CR`;
            const status = c.status !== 'AVAILABLE' ? `  [ ${c.status} ]` : '';

            print(`  ${id}${objective}${difficulty}${payout}${status}`);
            printBlank();
        }
    }

    print('  ACCEPT [ID]    ACCEPT A CONTRACT');
    print('  BACK           RETURN TO MENU');
    printBlank();
}

function printSoftwareBoard() {
    _nullroutePage = 'software';
    setNullrouteMode(true, 'software');

    cmdClear();
    printBlank();
    print('NULLROUTE // SOFTWARE MARKETPLACE');
    printBlank();
    print('  COMING SOON.');
    printBlank();
    print('  BACK    RETURN TO MENU');
    printBlank();
}

function printHardwareBoard() {
    _nullroutePage = 'hardware';
    setNullrouteMode(true, 'hardware');

    cmdClear();
    printBlank();
    print('NULLROUTE // HARDWARE MARKETPLACE');
    printBlank();
    print('  COMING SOON.');
    printBlank();
    print('  BACK    RETURN TO MENU');
    printBlank();
}

async function printOperatorBoard() {
    _nullroutePage = 'operators';
    setNullrouteMode(true, 'operators');

    cmdClear();
    printBlank();
    print('NULLROUTE // OPERATOR LEADERBOARD');
    printBlank();

    const result = await apiGetLeaderboard();

    if (!result.ok) {
        print('  FAILED TO FETCH LEADERBOARD.');
        printBlank();
        print('  BACK    RETURN TO MENU');
        printBlank();
        return;
    }

    print(`  ${'RANK'.padEnd(6)}${'HANDLE'.padEnd(16)}${'ID'.padEnd(12)}${'CLEARANCE'.padEnd(12)}BALANCE`);
    printBlank();

    result.operators.forEach((op, i) => {
        const rank = `#${i + 1}`.padEnd(6);
        const handle = op.handle.padEnd(16);
        const id = op.id.padEnd(12);
        const clearance = `TIER ${op.clearance}`.padEnd(12);
        const balance = `${Number(op.balance).toLocaleString()} CR`;
        const marker = op.handle === player.handle ? ' ◄' : '';

        print(`  ${rank}${handle}${id}${clearance}${balance}${marker}`);
        printBlank();
    });

    print('  BACK    RETURN TO MENU');
    printBlank();
}

async function printNodeBoard() {
    _nullroutePage = 'node';
    setNullrouteMode(true, 'node');

    cmdClear();
    printBlank();
    print('NULLROUTE // NODE PROFILE');
    printBlank();
    print(`  HANDLE:      ${player.handle}`);
    print(`  ID:          ${player.id}`);
    print(`  CLEARANCE:   TIER ${player.clearance}`);
    print(`  AFFILIATION: ${player.affiliation}`);
    print(`  BALANCE:     ${player.balance} CR`);
    printBlank();
    print('  CHANGEPASS   CHANGE YOUR PASSWORD');
    print('  DELETE       DELETE YOUR ACCOUNT');
    print('  BACK         RETURN TO MENU');
    printBlank();
}

async function cmdChangePass() {
    // prompt inline in the terminal using a locked input sequence
    printBlank();
    print('CHANGE PASSWORD');
    printBlank();

    const current = await terminalPrompt('CURRENT PASSWORD:', true);
    const next = await terminalPrompt('NEW PASSWORD:', true);
    const confirm = await terminalPrompt('CONFIRM PASSWORD:', true);

    printBlank();

    if (next !== confirm) {
        print('PASSWORDS DO NOT MATCH.');
        printBlank();
        return;
    }

    const result = await apiChangePassword(current, next);

    if (!result.ok) {
        print(`FAILED: ${result.reason}`);
        printBlank();
        return;
    }

    print('PASSWORD UPDATED.');
    printBlank();
}
cmdChangePass.description = 'CHANGE YOUR PASSWORD.';

async function cmdDeleteAccount() {
    printBlank();
    print('DELETE ACCOUNT');
    print('THIS ACTION IS PERMANENT. ALL DATA WILL BE LOST.');
    printBlank();

    const handle = await terminalPrompt('CONFIRM HANDLE:');
    const pass = await terminalPrompt('CONFIRM PASSWORD:', true);
    const confirm = await terminalPrompt('CONFIRM PASSWORD AGAIN:', true);

    printBlank();

    if (handle !== player.handle) {
        print('HANDLE MISMATCH. ABORTED.');
        printBlank();
        return;
    }

    if (pass !== confirm) {
        print('PASSWORDS DO NOT MATCH. ABORTED.');
        printBlank();
        return;
    }

    const result = await apiDeleteAccount(pass, confirm);

    if (!result.ok) {
        print(`FAILED: ${result.reason}`);
        printBlank();
        return;
    }

    print('ACCOUNT DELETED. TERMINATING SESSION.');
    printBlank();
    await new Promise(r => setTimeout(r, 2000));
    window.location.reload();
}
cmdDeleteAccount.description = 'DELETE YOUR ACCOUNT.';

async function cmdBack() {
    await printNullrouteMenu();
}
cmdBack.description = 'RETURN TO MENU.';

// Inline terminal prompt — locks input, renders a prompt line, resolves on Enter
function terminalPrompt(promptText, masked = false) {
    return new Promise(resolve => {
        inputLocked = true;

        const pre = document.createElement('pre');
        pre.textContent = `  ${promptText} `;
        container.insertBefore(pre, inputLine);

        let value = '';
        let displaySpan = document.createElement('span');
        pre.appendChild(displaySpan);

        const promptCursor = document.createElement('span');
        promptCursor.textContent = '_';
        promptCursor.style.animation = 'blink 0.7s step-end infinite';
        pre.appendChild(promptCursor);

        const handler = (e) => {
            if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
                playSound(clackSound);
            }

            if (e.key === 'Enter' && value.length > 0) {
                promptCursor.remove();
                document.removeEventListener('keydown', handler);
                inputLocked = false;
                resolve(value);
            } else if (e.key === 'Backspace') {
                value = value.slice(0, -1);
                displaySpan.textContent = masked ? '*'.repeat(value.length) : value;
            } else if (e.key.length === 1) {
                value += e.key.toUpperCase();
                displaySpan.textContent = masked ? '*'.repeat(value.length) : value;
            }

            scrollToBottom();
        };

        document.addEventListener('keydown', handler);
        scrollToBottom();
    });
}

function setNullrouteMode(active, page = 'menu') {
    if (active) {
        // Always snapshot full commands before modifying
        // Only snapshot once — don't overwrite the snapshot when switching pages
        if (!_fullCommands) _fullCommands = { ...commands };

        // Clear current registry
        for (const key of Object.keys(commands)) delete commands[key];

        // Always available in NULLROUTE
        commands.disconnect = cmdDisconnect;
        commands.exit = cmdExit;

        if (page === 'menu') {
            commands.news = printNewsBoard;
            commands.contracts = printContractBoard;
            commands.software = printSoftwareBoard;
            commands.hardware = printHardwareBoard;
            commands.operators = printOperatorBoard;
            commands.node = printNodeBoard;
        }

        if (page === 'news' || page === 'contracts' || page === 'software' ||
            page === 'hardware' || page === 'operators' || page === 'node') {
            commands.back = cmdBack;
        }

        if (page === 'contracts') {
            commands.accept = cmdAccept;
        }

        if (page === 'node') {
            commands.changepass = cmdChangePass;
            commands.delete = cmdDeleteAccount;
        }

    } else {
        if (_fullCommands) {
            for (const key of Object.keys(commands)) delete commands[key];
            Object.assign(commands, _fullCommands);
            _fullCommands = null;
        }
    }
}

// ── STOCK MARKET ──────────────────────────────────────────────────────────────

let _stockData = [];
let _stockPollTimer = null;

async function connectStockMarket() {
    connectedTo = 'STOCKMARKET';
    setStockMarketMode(true);

    printBlank();
    await typeLine('ROUTING TO MARKET NODE');
    await typeLine('AUTHENTICATING OPERATOR');
    await typeLine('FETCHING MARKET DATA');
    printBlank();

    const result = await apiGetStocks();
    if (!result.ok) {
        print('MARKET UNAVAILABLE. TRY AGAIN LATER.');
        connectedTo = null;
        setStockMarketMode(false);
        return;
    }

    _stockData = result.stocks;
    cmdClear();
    printStockBoard();

    _stockPollTimer = setInterval(async () => {
        const refresh = await apiGetStocks();
        if (refresh.ok) {
            _stockData = refresh.stocks;

        }
    }, 30000);

    statusConnection.textContent = 'CONNECTION: STOCKMARKET';
}

function printStockBoard() {
    printBlank();
    print(`  ${'TICKER'.padEnd(8)}${'COMPANY'.padEnd(24)}${'PRICE'.padEnd(14)}${'CHANGE'.padEnd(12)}${'OWNED'.padEnd(10)}VALUE`);
    printBlank();

    for (const s of _stockData) {
        const ticker = s.ticker.padEnd(8);
        const company = s.company.padEnd(24);
        const price = `${parseFloat(s.price).toFixed(2)} CR`.padEnd(14);
        const diff = parseFloat(s.price) - parseFloat(s.prev_price);
        const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '─';
        const change = `${arrow} ${Math.abs(diff).toFixed(2)}`.padEnd(12);
        const owned = (player.portfolio?.[s.ticker] ?? 0);
        const value = owned > 0 ? `${(owned * parseFloat(s.price)).toFixed(0)} CR` : '—';

        print(`  ${ticker}${company}${price}${change}${owned.toString().padEnd(10)}${value}`);
        printBlank();
    }

    const portfolioValue = _stockData.reduce((sum, s) => {
        return sum + (player.portfolio?.[s.ticker] ?? 0) * parseFloat(s.price);
    }, 0);

    printBlank();
    print(`  PORTFOLIO VALUE:  ${portfolioValue.toFixed(0)} CR`);
    printBlank();
    print('  COMMANDS: BUY [TICKER] [AMT]');
    print('            SELL [TICKER] [AMT]');
    print('            DISCONNECT');
    printBlank();
}

async function cmdBuy(args) {
    if (connectedTo !== 'STOCKMARKET') {
        print('NOT CONNECTED TO STOCK MARKET.');
        return;
    }

    const ticker = args[0]?.toUpperCase();
    const amount = parseInt(args[1]);

    if (!ticker || !amount || amount < 1) {
        print('USAGE: BUY [TICKER] [AMOUNT]');
        return;
    }

    const stock = _stockData.find(s => s.ticker === ticker);
    if (!stock) {
        print(`UNKNOWN TICKER: ${ticker}`);
        return;
    }

    const cost = Math.ceil(parseFloat(stock.price) * amount);

    const result = await apiBuyStock(ticker, amount);
    printBlank();

    if (!result.ok) {
        print(`FAILED: ${result.reason}`);
        return;
    }

    player.portfolio = result.portfolio;
    player.balance -= result.spent;
    await apiSaveGame(player, sessionTargets);

    statusBalance.textContent = `BAL: ${player.balance}CR`;

    cmdClear();
    printStockBoard();
    print(`PURCHASED. SPENT: ${result.spent} CR`);
    print(`NEW BALANCE: ${player.balance} CR`);
    print(`${ticker} OWNED: ${player.portfolio[ticker] ?? 0}`);
    printBlank();
}
cmdBuy.description = 'BUY SHARES.';

async function cmdSell(args) {
    if (connectedTo !== 'STOCKMARKET') {
        print('NOT CONNECTED TO STOCK MARKET.');
        return;
    }

    const ticker = args[0]?.toUpperCase();
    const amount = parseInt(args[1]);

    if (!ticker || !amount || amount < 1) {
        print('USAGE: SELL [TICKER] [AMOUNT]');
        return;
    }

    const owned = player.portfolio?.[ticker] ?? 0;
    if (owned === 0) {
        print(`YOU OWN NO SHARES IN ${ticker}.`);
        return;
    }

    const stock = _stockData.find(s => s.ticker === ticker);
    if (!stock) {
        print(`UNKNOWN TICKER: ${ticker}`);
        return;
    }

    const value = Math.floor(parseFloat(stock.price) * amount);

    const result = await apiSellStock(ticker, amount);
    printBlank();

    if (!result.ok) {
        print(`FAILED: ${result.reason}`);
        return;
    }

    player.portfolio = result.portfolio;
    player.balance += result.earned;
    await apiSaveGame(player, sessionTargets);

    statusBalance.textContent = `BAL: ${player.balance}CR`;

    cmdClear();
    printStockBoard();
    print(`SOLD. EARNED: ${result.earned} CR`);
    print(`NEW BALANCE: ${player.balance} CR`);
    print(`${ticker} OWNED: ${player.portfolio[ticker] ?? 0}`);
    printBlank();
}
cmdSell.description = 'SELL SHARES.';

let _fullStockCommands = null;

function setStockMarketMode(active) {
    if (active) {
        _fullStockCommands = { ...commands };
        for (const key of Object.keys(commands)) {
            if (!['buy', 'sell', 'disconnect', 'exit'].includes(key)) {
                delete commands[key];
            }
        }
        commands.buy = cmdBuy;
        commands.sell = cmdSell;
    } else {
        if (_fullStockCommands) {
            for (const key of Object.keys(commands)) delete commands[key];
            Object.assign(commands, _fullStockCommands);
            _fullStockCommands = null;
        }
        if (_stockPollTimer) {
            clearInterval(_stockPollTimer);
            _stockPollTimer = null;
        }
    }
}