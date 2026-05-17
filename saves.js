import { formatDate } from "./user-js/user-creation.js";

export function loadSaves() {
    return JSON.parse(localStorage.getItem('nullroute_saves') || '{}');
}

export async function saveGame(player, targets) {
    const saves = loadSaves();
    const toSave = { ...player };
    if (toSave.password && !toSave.password.startsWith('$2')) {
        toSave.password = await bcrypt.hash(toSave.password, 10);
    }
    saves[player.handle] = { player: toSave, targets };
    localStorage.setItem('nullroute_saves', JSON.stringify(saves));
}

export function loadSave(handle) {
    const saves = loadSaves();
    return saves[handle.toUpperCase()] || null;
}

export async function verifyPassword(input, hashed) {
    return await bcrypt.compare(input, hashed);
}

export function seedDefaultSave() {
    const saves = loadSaves();
    if (saves['NIX']) return;

    saves['NIX'] = {
        player: {
            handle: 'NIX',
            id: 'NR-0001',
            password: '$2b$10$aIyek/n44hEqiF1MA0ghouikIqRmUJw0XcK7YecHQpz.TDPfiljNa',
            clearance: 10,
            balance: 999999,
            affiliation: 'NULLROUTE',
            tools: [
                { name: 'portScan', level: 5, ramUsage: 120, size: 10, active: false },
                { name: 'passCrack', level: 5, ramUsage: 320, size: 15, active: false },
                { name: 'connect', level: 5, ramUsage: 0, size: 5, active: false },
            ],
            installedFiles: [],
            hardware: {
                cpu: { name: 'CRUX ALPHA-600', clockSpeed: 600, power: 10 },
                ram: {
                    totalRAM: 16384,

                    get usedRAM() {
                        return saves['NIX'].player.tools
                            .filter(t => t.active)
                            .reduce((sum, t) => sum + t.ramUsage, 0);
                    },

                    get availableRAM() {
                        return this.totalRAM - this.usedRAM
                    },
                },
                storage: {
                    name: 'IRONCORE IC-16000',
                    totalSize: 8000,

                    get usedSize() { // Size,  in MB
                        const toolsSize = saves['NIX'].player.tools.reduce((sum, t) => sum + t.size, 0);
                        const filesSize = saves['NIX'].player.installedFiles.reduce((sum, f) => sum + f.size, 0);
                        return toolsSize + filesSize;
                    },

                    get availableSize() { // Size, in MB
                        return this.totalSize - this.usedSize;
                    }
                },
                bandwidth: { upload: 4096, download: 8192 },
            },
            traceBuffer: 1800000,
            log: [
                { date: '05/17/1994, 14:30:09', type: 'INIT', desc: 'NULLROUTE SERVICES INITIALISED' },
                { date: '05/17/1994, 14:30:09', type: 'INIT', desc: 'A.D.M.N. GRID ONLINE' },
                { date: '05/17/1994, 14:30:10', type: 'INIT', desc: 'RELAY NODE ALLOCATED' },
                { date: '05/17/1994, 14:30:10', type: 'INIT', desc: 'ENCRYPTION KEYS GENERATED' },
                { date: '05/17/1994, 14:30:011', type: 'INIT', desc: 'ROUTING TABLE CONFIGURED' },
                { date: '05/17/1994, 14:30:11', type: 'INIT', desc: 'CONTRACT MODULE LOADED' },
                { date: '05/17/1994, 14:30:23', type: 'INIT', desc: 'SYSTEM READY' },

                { date: '05/17/1994, 17:13:48', type: 'REGISTRATION', desc: 'OPERATOR REGISTRATION INITIATED' },
                { date: '05/17/1994, 17:13:48', type: 'REGISTRATION', desc: 'HANDLE VERIFIED: NIX' },
                { date: '05/17/1994, 17:13:48', type: 'REGISTRATION', desc: 'OPERATOR ID ASSIGNED: NR-0001' },
                { date: '05/17/1994, 17:13:48', type: 'REGISTRATION', desc: 'CLEARANCE SET: TIER 10' },
                { date: '05/17/1994, 17:13:48', type: 'REGISTRATION', desc: 'RELAY NODE BOUND TO OPERATOR' },
                { date: '05/17/1994, 17:13:48', type: 'REGISTRATION', desc: 'REGISTRATION COMPLETE' },

                { date: '05/17/1994, 17:13:49', type: 'LOG IN' },
                { date: '05/17/1994, 17:13:49', type: 'INIT', desc: 'GRID DIAGNOSTIC INITIATED' },
                { date: '05/17/1994, 17:13:52', type: 'INIT', desc: 'GRID DIAGNOSTIC COMPLETE' },
                { date: '05/17/1994, 17:13:54', type: 'INIT', desc: 'CONTRACT BOARD SEEDED' },
                { date: '05/17/1994, 17:13:58', type: 'DOWNLOAD', file: 'PORTSCAN v1, PASSCRACK v1, CONNECT v1' },
                { date: '05/17/1994, 17:13:54', type: 'INIT', desc: 'SYSTEM HANDOFF COMPLETE' },
            ],
        },
        targets: [],
    };

    localStorage.setItem('nullroute_saves', JSON.stringify(saves));
}