// saves.js
// ─────────────────────────────────────────────────────────────────────────────
// Raw localStorage read/write primitives.
//
// These are prefixed _ls_ to make it obvious they are local-storage-specific
// and should never be imported directly by game modules — only by api.js.
//
// Game modules should import from api.js instead.
// ─────────────────────────────────────────────────────────────────────────────

const SAVE_KEY = 'nullroute_saves';

export function _ls_loadSaves() {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
}

export function _ls_writeSaves(saves) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
}

// ── SEED ──────────────────────────────────────────────────────────────────────
// Seeds the NIX and ADMIN special saves on first load.
// Called once from main.js before userCreation().
// Nothing outside this file or api.js should call _ls_loadSaves directly.

export function _ls_seedDefaultSave() {
    const saves = _ls_loadSaves();
    if (saves['NIX'] && saves['ADMIN']) return;

    if (!saves['NIX']) {
        saves['NIX'] = _makeNixSave();
    }

    if (!saves['ADMIN']) {
        saves['ADMIN'] = _makeAdminSave();
    }

    _ls_writeSaves(saves);
}

// ── SPECIAL SAVE FACTORIES ────────────────────────────────────────────────────
// Kept here (not in api.js) because they are purely local concerns —
// there are no NIX/ADMIN rows in the real database; the GM logs in via
// the admin dashboard with a real account.

function _makeNixSave() {
    return {
        player: {
            handle: 'NIX',
            id: 'NR-0001',
            // password: 'NULLROUTE'
            password: '$2b$10$aIyek/n44hEqiF1MA0ghouikIqRmUJw0XcK7YecHQpz.TDPfiljNa',
            clearance: 10,
            balance: 999999,
            affiliation: 'NULLROUTE',
            inbox: [],
            tools: [
                { name: 'portScan', level: 5, ramUsage: 120, size: 10,  active: false },
                { name: 'passCrack', level: 5, ramUsage: 320, size: 15, active: false },
                { name: 'connect',   level: 5, ramUsage: 0,   size: 5,  active: false },
            ],
            installedFiles: [],
            hardware: {
                cpu:       { name: 'CRUX ALPHA-600',   clockSpeed: 600,  power: 10 },
                ram:       { totalRAM: 16384 },
                storage:   { name: 'IRONCORE IC-16000', totalSize: 8000 },
                bandwidth: { upload: 4096, download: 8192 },
            },
            traceBuffer: 1800000,
            log: [
                { date: '05/17/1994, 14:30:09',  type: 'INIT',         desc: 'NULLROUTE SERVICES INITIALISED' },
                { date: '05/17/1994, 14:30:09',  type: 'INIT',         desc: 'A.D.M.N. GRID ONLINE' },
                { date: '05/17/1994, 14:30:10',  type: 'INIT',         desc: 'RELAY NODE ALLOCATED' },
                { date: '05/17/1994, 14:30:10',  type: 'INIT',         desc: 'ENCRYPTION KEYS GENERATED' },
                { date: '05/17/1994, 14:30:011', type: 'INIT',         desc: 'ROUTING TABLE CONFIGURED' },
                { date: '05/17/1994, 14:30:11',  type: 'INIT',         desc: 'CONTRACT MODULE LOADED' },
                { date: '05/17/1994, 14:30:23',  type: 'INIT',         desc: 'SYSTEM READY' },
                { date: '05/17/1994, 17:13:48',  type: 'REGISTRATION', desc: 'OPERATOR REGISTRATION INITIATED' },
                { date: '05/17/1994, 17:13:48',  type: 'REGISTRATION', desc: 'HANDLE VERIFIED: NIX' },
                { date: '05/17/1994, 17:13:48',  type: 'REGISTRATION', desc: 'OPERATOR ID ASSIGNED: NR-0001' },
                { date: '05/17/1994, 17:13:48',  type: 'REGISTRATION', desc: 'CLEARANCE SET: TIER 10' },
                { date: '05/17/1994, 17:13:48',  type: 'REGISTRATION', desc: 'RELAY NODE BOUND TO OPERATOR' },
                { date: '05/17/1994, 17:13:48',  type: 'REGISTRATION', desc: 'REGISTRATION COMPLETE' },
                { date: '05/17/1994, 17:13:49',  type: 'LOG IN' },
                { date: '05/17/1994, 17:13:49',  type: 'INIT',         desc: 'GRID DIAGNOSTIC INITIATED' },
                { date: '05/17/1994, 17:13:52',  type: 'INIT',         desc: 'GRID DIAGNOSTIC COMPLETE' },
                { date: '05/17/1994, 17:13:54',  type: 'INIT',         desc: 'CONTRACT BOARD SEEDED' },
                { date: '05/17/1994, 17:13:58',  type: 'DOWNLOAD',     file: 'PORTSCAN v1, PASSCRACK v1, CONNECT v1' },
                { date: '05/17/1994, 17:13:54',  type: 'INIT',         desc: 'SYSTEM HANDOFF COMPLETE' },
            ],
        },
        targets: [],
    };
}

function _makeAdminSave() {
    return {
        player: {
            handle: 'ADMIN',
            id: 'NR-9999',
            // password: 'NULLROUTE'
            password: '$2b$10$oPcdCmuTS.AnKICe7fEexu.qdTPJ3Md0wplyTZ1op4V.Uhn7bRQSG',
            clearance: 10,
            balance: 999999,
            affiliation: 'NULLROUTE',
            inbox: [],
            tools: [
                { name: 'portScan', level: 5, ramUsage: 120, size: 10,  active: false },
                { name: 'passCrack', level: 5, ramUsage: 320, size: 15, active: false },
                { name: 'connect',   level: 5, ramUsage: 0,   size: 5,  active: false },
            ],
            installedFiles: [],
            hardware: {
                cpu:       { name: 'CRUX ALPHA-600',   clockSpeed: 600,  power: 10 },
                ram:       { totalRAM: 16384 },
                storage:   { name: 'IRONCORE IC-16000', totalSize: 8000 },
                bandwidth: { upload: 4096, download: 8192 },
            },
            traceBuffer: 1800000,
            log: [],
        },
        targets: [],
    };
}