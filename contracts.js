import { player, formatDate } from './user-creation.js';
import { apiSaveGame } from './api.js';

// ── CONSTANTS ─────────────────────────────────────────

const CONTRACT_COUNT_MIN = 5;
const CONTRACT_COUNT_MAX = 10;
const REFRESH_MIN = 5 * 60 * 1000;  // 5 minutes
const REFRESH_MAX = 10 * 60 * 1000; // 10 minutes

const OBJECTIVES = ['EXFILTRATE', 'SABOTAGE', 'PLANT', 'DESTROY'];

const OBJECTIVE_MULTIPLIERS = {
    EXFILTRATE: 1.0,
    SABOTAGE:   1.2,
    PLANT:      1.5,
    DESTROY:    2.0,
};

const OBJECTIVE_DESCRIPTIONS = {
    EXFILTRATE: 'RETRIEVE TARGET DATA FROM HOST SYSTEM.',
    SABOTAGE:   'LOCATE AND DESTROY SPECIFIED FILE ON HOST SYSTEM.',
    PLANT:      'INSTALL BACKDOOR PACKAGE ON HOST SYSTEM.',
    DESTROY:    'TAKE TARGET SYSTEM OFFLINE. LEAVE NOTHING RUNNING.',
};

// ── STATE ─────────────────────────────────────────────

export let contractBoard = [];  // rolling board, 5-10 contracts
export let refreshTimer = null;

// ── ID GENERATION ─────────────────────────────────────

function generateContractId(existingIds = []) {
    let id;
    do {
        id = `NR-C-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (existingIds.includes(id));
    return id;
}

// ── PAYOUT ────────────────────────────────────────────

function calculatePayout(difficulty, objective) {
    const base = difficulty * 500;
    const multiplier = OBJECTIVE_MULTIPLIERS[objective];
    return Math.round(base * multiplier);
}

// ── GENERATION ────────────────────────────────────────

export function generateContracts(sessionTargets) {
    const usedIds = [
        ...contractBoard.map(c => c.id),
        ...player.inbox.map(c => c.id),
    ];

    const count = Math.floor(
        Math.random() * (CONTRACT_COUNT_MAX - CONTRACT_COUNT_MIN + 1) + CONTRACT_COUNT_MIN
    );

    // shuffle targets and pick `count` of them
    const shuffled = [...sessionTargets].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    contractBoard = picked.map(target => {
        const objective = OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)];
        const id = generateContractId(usedIds);
        usedIds.push(id);

        return {
            id,
            objective,
            description: OBJECTIVE_DESCRIPTIONS[objective],
            target: target.name,
            targetIp: target.ip,
            difficulty: target.difficulty,
            security: target.security,
            payout: calculatePayout(target.difficulty, objective),
            status: 'AVAILABLE',  // AVAILABLE | ACCEPTED | COMPLETE | FAILED | EXPIRED
        };
    });
}

// ── REFRESH TIMER ─────────────────────────────────────

export function startContractRefresh(sessionTargets) {
    scheduleRefresh(sessionTargets);
}

function scheduleRefresh(sessionTargets) {
    const delay = Math.floor(Math.random() * (REFRESH_MAX - REFRESH_MIN + 1) + REFRESH_MIN);
    refreshTimer = setTimeout(() => {
        // expire any remaining AVAILABLE contracts on the board
        contractBoard = contractBoard.map(c =>
            c.status === 'AVAILABLE' ? { ...c, status: 'EXPIRED' } : c
        );
        generateContracts(sessionTargets);
        scheduleRefresh(sessionTargets); // schedule next refresh
    }, delay);
}

// ── ACCEPT ────────────────────────────────────────────

export async function acceptContract(id, sessionTargets) {
    const contract = contractBoard.find(c => c.id === id);

    if (!contract) return { ok: false, reason: 'CONTRACT NOT FOUND.' };
    if (contract.status !== 'AVAILABLE') return { ok: false, reason: `CONTRACT ${id} IS ${contract.status}.` };
    if (contract.difficulty > player.clearance) return { ok: false, reason: 'INSUFFICIENT CLEARANCE.' };
    if (player.inbox.filter(c => c.status === 'ACCEPTED').length >= 5) {
        return { ok: false, reason: 'INBOX FULL. MAXIMUM 5 ACTIVE CONTRACTS.' };
    }

    contract.status = 'ACCEPTED';
    const accepted = {
        ...contract,
        acceptedDate: formatDate(Date.now()),
    };

    player.inbox.push(accepted);
    await apiSaveGame(player, sessionTargets);

    return { ok: true, contract: accepted };
}