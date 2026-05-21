import { player, formatDate, sendToInbox } from './user-creation.js';
import { apiSaveGame } from './api.js';

// ── CONSTANTS ─────────────────────────────────────────

const CONTRACT_COUNT_MIN = 5;
const CONTRACT_COUNT_MAX = 10;
const REFRESH_MIN = 5 * 60 * 1000;
const REFRESH_MAX = 10 * 60 * 1000;

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

// ── THEMED FILE NAMES ─────────────────────────────────

const DECOY_FILES = {
    DEFAULT:  ['SYSTEM.LOG', 'CONFIG.BAK', 'README.TXT', 'BOOT.CFG', 'KERNEL.DAT', 'TRACE.LOG', 'CACHE.TMP', 'INDEX.DAT', 'PROC.SYS', 'ENV.CFG'],
    MEDICAL:  ['PATIENT_DB.DAT', 'MED_RECORDS.BAK', 'DOSAGE.LOG', 'SCAN_RESULTS.DAT', 'LAB_REPORT.TXT', 'PHARMACY.CFG', 'TRIAL_DATA.DAT', 'CLINICAL.LOG'],
    MILITARY: ['OPS_BRIEF.DAT', 'PERSONNEL.BAK', 'WEAPONS_LOG.DAT', 'MISSION.CFG', 'INTEL_RPT.DAT', 'CLEARANCE.LOG', 'DEPLOY.TXT', 'TACTICAL.DAT'],
    FINANCE:  ['LEDGER.DAT', 'ACCOUNTS.BAK', 'TRANSFER.LOG', 'AUDIT.DAT', 'BALANCE.CFG', 'TRANSACTION.LOG', 'PORTFOLIO.DAT', 'WIRE.TXT'],
    RESEARCH: ['EXPERIMENT.DAT', 'RESULTS.BAK', 'PROTOCOL.LOG', 'SPECIMEN.DAT', 'ANALYSIS.TXT', 'COMPOUND.CFG', 'TRIAL.LOG', 'FORMULA.DAT'],
    ENERGY:   ['GRID.DAT', 'REACTOR.LOG', 'OUTPUT.BAK', 'TURBINE.CFG', 'SCADA.DAT', 'POWER.LOG', 'FAULT.TXT', 'SENSOR.DAT'],
    TECH:     ['BUILD.DAT', 'SOURCE.BAK', 'DEPLOY.LOG', 'MODULE.CFG', 'BINARY.DAT', 'PATCH.TXT', 'VERSION.LOG', 'COMPILE.DAT'],
    MEDIA:    ['BROADCAST.DAT', 'ARCHIVE.BAK', 'SCHEDULE.LOG', 'CONTENT.DAT', 'FEED.CFG', 'STREAM.LOG', 'ASSET.TXT', 'ENCODE.DAT'],
};

const OBJECTIVE_FILES = {
    EXFILTRATE: ['CLASSIFIED.DAT', 'SECRETS.DAT', 'INTEL.DAT', 'RECORDS.DAT', 'PAYLOAD.DAT', 'EXTRACT.DAT'],
    SABOTAGE:   ['TARGET.DAT', 'CORE.SYS', 'PRIMARY.DAT', 'MAIN.CFG', 'ROOT.DAT', 'BASE.SYS'],
    PLANT:      ['BACKDOOR.PKG', 'IMPLANT.PKG', 'GHOST.PKG', 'RELAY.PKG', 'HOOK.PKG', 'BRIDGE.PKG'],
    DESTROY:    ['KERNEL.SYS', 'INIT.SYS', 'MASTER.DAT', 'CORE.DAT', 'BOOT.SYS', 'ROOT.SYS'],
};

function getTheme(serverName) {
    const n = serverName.toUpperCase();
    if (n.includes('MEDICAL') || n.includes('PHARMA') || n.includes('BIOTECH') || n.includes('CLINICAL')) return 'MEDICAL';
    if (n.includes('DEFENSE') || n.includes('ARMS') || n.includes('MILITARY') || n.includes('NAVAL') || n.includes('COMMAND') || n.includes('WEAPONS')) return 'MILITARY';
    if (n.includes('BANK') || n.includes('FINANCE') || n.includes('TRADING') || n.includes('EXCHANGE') || n.includes('FINANCIAL')) return 'FINANCE';
    if (n.includes('RESEARCH') || n.includes('LAB') || n.includes('SCIENCE') || n.includes('NEUROTEC')) return 'RESEARCH';
    if (n.includes('ENERGY') || n.includes('POWER') || n.includes('REACTOR') || n.includes('GRID')) return 'ENERGY';
    if (n.includes('TECH') || n.includes('DATA') || n.includes('NETWORK') || n.includes('SYSTEMS')) return 'TECH';
    if (n.includes('MEDIA') || n.includes('BROADCAST') || n.includes('CONTENT')) return 'MEDIA';
    return 'DEFAULT';
}

function generateFileSystem(target, objective, difficulty) {
    const theme = getTheme(target.name);
    const pool  = [...(DECOY_FILES[theme] ?? DECOY_FILES.DEFAULT)];

    // scale file count with difficulty: 2-4 base, +1 per 2 difficulty levels
    const base  = 2 + Math.floor(Math.random() * 3);
    const bonus = Math.floor(difficulty / 2);
    const count = Math.min(base + bonus, pool.length);

    // shuffle and pick decoys
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);

    // inject objective file
    const objPool   = OBJECTIVE_FILES[objective];
    const objFile   = objPool[Math.floor(Math.random() * objPool.length)];

    return { files: [...shuffled, objFile], objectiveFile: objFile };
}

function generateExfilDestination() {
    // IPs in the 10.x.x.x range reserved for contract destinations
    const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    return `10.${r(10, 99)}.${r(0, 255)}.${r(1, 254)}`;
}

function generatePlantFile(contractId) {
    return {
        name: `PAYLOAD_${contractId.replace('NR-C-', '')}.PKG`,
        size: 2,
        contractId,
        type: 'plant-payload',
    };
}

// ── STATE ─────────────────────────────────────────────

export let contractBoard = [];
export let refreshTimer  = null;

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
    const base       = difficulty * 500;
    const multiplier = OBJECTIVE_MULTIPLIERS[objective];
    return Math.round(base * multiplier);
}

// ── GENERATION ────────────────────────────────────────

export function generateContracts(sessionTargets) {
    const usedIds = [
        ...contractBoard.map(c => c.id),
        ...player.inbox.map(c => c.id),
    ];

    const count    = Math.floor(Math.random() * (CONTRACT_COUNT_MAX - CONTRACT_COUNT_MIN + 1) + CONTRACT_COUNT_MIN);
    const shuffled = [...sessionTargets].sort(() => Math.random() - 0.5);
    const picked   = shuffled.slice(0, count);

    contractBoard = picked.map(target => {
        const objective  = OBJECTIVES[Math.floor(Math.random() * OBJECTIVES.length)];
        const id         = generateContractId(usedIds);
        usedIds.push(id);

        const { files, objectiveFile } = generateFileSystem(target, objective, target.difficulty);

        const contract = {
            id,
            objective,
            description:   OBJECTIVE_DESCRIPTIONS[objective],
            target:        target.name,
            targetIp:      target.ip,
            difficulty:    target.difficulty,
            security:      target.security,
            payout:        calculatePayout(target.difficulty, objective),
            status:        'AVAILABLE',
            fileSystem:    files,
            objectiveFile,
        };

        if (objective === 'EXFILTRATE') {
            contract.exfilDestination = generateExfilDestination();
        }

        if (objective === 'PLANT') {
            contract.plantFile = generatePlantFile(id);
        }

        return contract;
    });
}

// ── REFRESH TIMER ─────────────────────────────────────

export function startContractRefresh(sessionTargets) {
    scheduleRefresh(sessionTargets);
}

function scheduleRefresh(sessionTargets) {
    const delay = Math.floor(Math.random() * (REFRESH_MAX - REFRESH_MIN + 1) + REFRESH_MIN);
    refreshTimer = setTimeout(() => {
        contractBoard = contractBoard.map(c =>
            c.status === 'AVAILABLE' ? { ...c, status: 'EXPIRED' } : c
        );
        generateContracts(sessionTargets);
        scheduleRefresh(sessionTargets);
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
    const accepted  = { ...contract, acceptedDate: formatDate(Date.now()) };

    sendToInbox(accepted);
    await apiSaveGame(player, sessionTargets);

    return { ok: true, contract: accepted };
}