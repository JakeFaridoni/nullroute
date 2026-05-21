import { beepSound, navigateInboxSound, playSound } from './boot/boot.js';
import { apiSaveGame } from './api.js';
import { player, sessionTargets } from './user-creation.js';

// ── STATE ─────────────────────────────────────────────

let container;
let selectedIndex = 0;

// ── INIT ──────────────────────────────────────────────

export function initInbox(el) {
    container = el;
    render();
}

// ── RENDER ────────────────────────────────────────────

export function render() {
    container.innerHTML = '';

    const inbox = (player.inbox ?? []).filter(i => !i.deleted);

    // outer wrapper — two column layout
    const wrapper = document.createElement('div');
    wrapper.id = 'inbox-wrapper';
    container.appendChild(wrapper);

    // ── LEFT: message list ─────────────────────────────

    const list = document.createElement('div');
    list.id = 'inbox-list';
    wrapper.appendChild(list);

    if (inbox.length === 0) {
        const empty = document.createElement('pre');
        empty.className = 'inbox-empty';
        empty.textContent = 'NO MESSAGES.';
        list.appendChild(empty);
    } else {
        selectedIndex = Math.min(selectedIndex, inbox.length - 1);

        inbox.forEach((item, i) => {
            const isSelected = i === selectedIndex;

            const row = document.createElement('pre');
            row.className = 'inbox-row' + (isSelected ? ' inbox-selected' : '');

            const label = item.type === 'message' || item.type === 'story-contract' || item.type === 'nix-message'
                ? item.title
                : item.id;

            row.textContent = label;
            row.addEventListener('click', () => {
                selectedIndex = i;
                playSound(navigateInboxSound);
                render();
            });

            list.appendChild(row);

            // divider between rows
            const div = document.createElement('div');
            div.className = 'inbox-row-divider';
            list.appendChild(div);
        });
    }

    // ── RIGHT: detail pane ─────────────────────────────

    const detail = document.createElement('div');
    detail.id = 'inbox-detail';
    wrapper.appendChild(detail);

    const selected = inbox[selectedIndex];
    if (!selected) return;

    // title bar
    const titleBar = document.createElement('pre');
    titleBar.id = 'inbox-detail-title';
    titleBar.textContent = selected.type === 'message' || selected.type === 'story-contract' || selected.type === 'nix-message'
        ? selected.title
        : selected.id;
    detail.appendChild(titleBar);

    const titleDivider = document.createElement('div');
    titleDivider.className = 'inbox-title-divider';
    detail.appendChild(titleDivider);

    // body
    const body = document.createElement('div');
    body.id = 'inbox-detail-body';
    detail.appendChild(body);

    if (selected.type === 'message' || selected.type === 'story-contract' || selected.type === 'nix-message') {
        renderMessage(selected, body);
    } else {
        renderContract(selected, body);
    }
}

function renderMessage(msg, body) {
    for (const line of msg.content) {
        const pre = document.createElement('pre');
        pre.className = 'inbox-detail-line';
        pre.textContent = line === '' ? '\u00A0' : line;
        body.appendChild(pre);
    }

    const blank = document.createElement('pre');
    blank.innerHTML = '&nbsp;';
    body.appendChild(blank);

    const deleteBtn = document.createElement('pre');
    deleteBtn.className = 'inbox-delete-btn';
    deleteBtn.textContent = '[ DELETE ]';
    deleteBtn.addEventListener('click', () => {
        msg.deleted = true;
        playSound(beepSound);
        apiSaveGame(player, sessionTargets);
        render();
    });
    body.appendChild(deleteBtn);
}

function renderContract(contract, body) {
    const lines = [
        `STATUS:    ${contract.status}`,
        ``,
        `TARGET:    ${contract.target}`,
        `IP:        ${contract.targetIp}`,
        ``,
        `OBJ:       ${contract.objective}`,
        `           ${contract.description}`,
        ``,
        `FILE:      ${contract.objectiveFile ?? '—'}`,
        contract.exfilDestination ? `DEST:      ${contract.exfilDestination}` : null,
        ``,
        `PAYOUT:    ${contract.payout.toLocaleString()} CR`,
        `SECURITY:  MON ${contract.security.monitor}  PRX ${contract.security.proxy}  FW ${contract.security.firewall}`,
        ``,
        `ACCEPTED:  ${contract.acceptedDate ?? '—'}`,
    ].filter(l => l !== null);

    for (const line of lines) {
        const pre = document.createElement('pre');
        pre.className = 'inbox-detail-line';
        pre.textContent = line === '' ? '\u00A0' : line;
        body.appendChild(pre);
    }

    // PLANT contracts get a download button for the payload file
    if (contract.status === 'ACCEPTED' && contract.objective === 'PLANT' && contract.plantFile) {
        const alreadyOwned = player.installedFiles.some(f => f.contractId === contract.id);

        const blank = document.createElement('pre');
        blank.innerHTML = '&nbsp;';
        body.appendChild(blank);

        if (alreadyOwned) {
            const owned = document.createElement('pre');
            owned.className = 'inbox-detail-line';
            owned.textContent = `[ PAYLOAD DOWNLOADED: ${contract.plantFile.name} ]`;
            body.appendChild(owned);
        } else {
            const dlBtn = document.createElement('pre');
            dlBtn.className = 'inbox-delete-btn'; // reuse the hover style
            dlBtn.textContent = `[ DOWNLOAD PAYLOAD: ${contract.plantFile.name} ]`;
            dlBtn.addEventListener('click', () => {
                if (player.hardware.storage.availableSize < contract.plantFile.size) {
                    dlBtn.textContent = '[ INSUFFICIENT STORAGE ]';
                    return;
                }
                player.installedFiles.push(contract.plantFile);
                apiSaveGame(player, sessionTargets);
                render();
                playSound(beepSound);
            });
            body.appendChild(dlBtn);
        }
    }
}

// ── NAVIGATION ────────────────────────────────────────

export function inboxUp() {
    const inbox = player.inbox ?? [];
    if (inbox.length === 0) return;
    selectedIndex = Math.max(selectedIndex - 1, 0);
    render();
}

export function inboxDown() {
    const inbox = player.inbox ?? [];
    if (inbox.length === 0) return;
    selectedIndex = Math.min(selectedIndex + 1, inbox.length - 1);
    render();
}