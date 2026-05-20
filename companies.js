// GLOBAL COMPANIES -- all players + stock market

export const globalCompanies = [
  {
    name: 'CRESTFIELD SOLUTIONS',
    stock: { ticker: 'CRST', price: 44, volatility: 0.08 },
    baseDifficulty: 1,
    servers: [
      { serverType: 'PUBLIC',     diffOffset: 0, security: { monitor: 1, proxy: 0, firewall: 0 } },
      { serverType: 'EXTERNAL',   diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 0 } },
      { serverType: 'INTERNAL',   diffOffset: 2, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'DATACENTER', diffOffset: 2, security: { monitor: 3, proxy: 1, firewall: 1 } },
      { serverType: 'MAINFRAME',  diffOffset: 3, security: { monitor: 3, proxy: 2, firewall: 2 } },
    ],
  },
  {
    name: 'PEMBROOK DEFENSE',
    stock: { ticker: 'PEMB', price: 198, volatility: 0.08 },
    baseDifficulty: 6,
    servers: [
      { serverType: 'PUBLIC',      diffOffset: 0, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'EXTERNAL',    diffOffset: 1, security: { monitor: 4, proxy: 2, firewall: 3 } },
      { serverType: 'INTERNAL',    diffOffset: 2, security: { monitor: 4, proxy: 3, firewall: 3 } },
      { serverType: 'WEAPONS LAB', diffOffset: 2, security: { monitor: 5, proxy: 3, firewall: 4 } },
      { serverType: 'COMMAND',     diffOffset: 3, security: { monitor: 5, proxy: 4, firewall: 5 } },
    ],
  },
  {
    name: 'HELIX BIOTECH',
    stock: { ticker: 'HLX', price: 112, volatility: 0.08 },
    baseDifficulty: 3,
    servers: [
      { serverType: 'PUBLIC',         diffOffset: 0, security: { monitor: 1, proxy: 0, firewall: 1 } },
      { serverType: 'EXTERNAL',       diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'INTERNAL',       diffOffset: 2, security: { monitor: 2, proxy: 2, firewall: 2 } },
      { serverType: 'LAB NETWORK',    diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'SPECIMEN VAULT', diffOffset: 3, security: { monitor: 4, proxy: 3, firewall: 3 } },
    ],
  },
  {
    name: 'AXIOM RESEARCH',
    stock: { ticker: 'AXIM', price: 87, volatility: 0.08 },
    baseDifficulty: 3,
    servers: [
      { serverType: 'PUBLIC',         diffOffset: 0, security: { monitor: 1, proxy: 0, firewall: 1 } },
      { serverType: 'EXTERNAL',       diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'INTERNAL',       diffOffset: 2, security: { monitor: 2, proxy: 2, firewall: 2 } },
      { serverType: 'RESEARCH GRID',  diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'ARCHIVE',        diffOffset: 3, security: { monitor: 4, proxy: 3, firewall: 3 } },
    ],
  },
  {
    name: 'VECTOR ARMS',
    stock: { ticker: 'VCTR', price: 174, volatility: 0.08 },
    baseDifficulty: 6,
    servers: [
      { serverType: 'PUBLIC',      diffOffset: 0, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'EXTERNAL',    diffOffset: 1, security: { monitor: 3, proxy: 2, firewall: 3 } },
      { serverType: 'INTERNAL',    diffOffset: 2, security: { monitor: 4, proxy: 3, firewall: 3 } },
      { serverType: 'ARSENAL',     diffOffset: 2, security: { monitor: 4, proxy: 4, firewall: 4 } },
      { serverType: 'DEVELOPMENT', diffOffset: 3, security: { monitor: 5, proxy: 4, firewall: 4 } },
    ],
  },
  {
    name: 'POLARIS ENERGY',
    stock: { ticker: 'PLRS', price: 133, volatility: 0.08 },
    baseDifficulty: 5,
    servers: [
      { serverType: 'PUBLIC',       diffOffset: 0, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'EXTERNAL',     diffOffset: 1, security: { monitor: 3, proxy: 1, firewall: 2 } },
      { serverType: 'INTERNAL',     diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 3 } },
      { serverType: 'GRID CONTROL', diffOffset: 2, security: { monitor: 4, proxy: 3, firewall: 3 } },
      { serverType: 'REACTOR CORE', diffOffset: 3, security: { monitor: 5, proxy: 4, firewall: 4 } },
    ],
  },
  {
    name: 'CASCADE POWER',
    stock: { ticker: 'CSCD', price: 98, volatility: 0.08 },
    baseDifficulty: 4,
    servers: [
      { serverType: 'PUBLIC',      diffOffset: 0, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'EXTERNAL',    diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 2 } },
      { serverType: 'INTERNAL',    diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'TURBINE NET', diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 3 } },
      { serverType: 'SCADA',       diffOffset: 3, security: { monitor: 4, proxy: 3, firewall: 4 } },
    ],
  },
  {
    name: 'REDSTONE MINING',
    stock: { ticker: 'RDST', price: 61, volatility: 0.08 },
    baseDifficulty: 2,
    servers: [
      { serverType: 'PUBLIC',         diffOffset: 0, security: { monitor: 1, proxy: 0, firewall: 0 } },
      { serverType: 'EXTERNAL',       diffOffset: 1, security: { monitor: 1, proxy: 1, firewall: 1 } },
      { serverType: 'INTERNAL',       diffOffset: 2, security: { monitor: 2, proxy: 1, firewall: 2 } },
      { serverType: 'EXCAVATION NET', diffOffset: 2, security: { monitor: 2, proxy: 2, firewall: 2 } },
      { serverType: 'LOGISTICS',      diffOffset: 3, security: { monitor: 3, proxy: 2, firewall: 3 } },
    ],
  },
  {
    name: 'CITADEL ARMS',
    stock: { ticker: 'CTDL', price: 155, volatility: 0.08 },
    baseDifficulty: 5,
    servers: [
      { serverType: 'PUBLIC',    diffOffset: 0, security: { monitor: 2, proxy: 1, firewall: 2 } },
      { serverType: 'EXTERNAL',  diffOffset: 1, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'INTERNAL',  diffOffset: 2, security: { monitor: 3, proxy: 3, firewall: 3 } },
      { serverType: 'DEPOT',     diffOffset: 2, security: { monitor: 4, proxy: 3, firewall: 3 } },
      { serverType: 'R&D',       diffOffset: 3, security: { monitor: 4, proxy: 4, firewall: 4 } },
    ],
  },
  {
    name: 'ASHFORD MEDICAL',
    stock: { ticker: 'ASHM', price: 76, volatility: 0.08 },
    baseDifficulty: 2,
    servers: [
      { serverType: 'PUBLIC',          diffOffset: 0, security: { monitor: 1, proxy: 0, firewall: 0 } },
      { serverType: 'EXTERNAL',        diffOffset: 1, security: { monitor: 1, proxy: 1, firewall: 1 } },
      { serverType: 'INTERNAL',        diffOffset: 2, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'PATIENT RECORDS', diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'PHARMACY',        diffOffset: 3, security: { monitor: 3, proxy: 2, firewall: 3 } },
    ],
  },
  {
    name: 'CRUCIBLE TECH',
    stock: { ticker: 'CRCB', price: 119, volatility: 0.08 },
    baseDifficulty: 4,
    servers: [
      { serverType: 'PUBLIC',     diffOffset: 0, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'EXTERNAL',   diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 2 } },
      { serverType: 'INTERNAL',   diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'DEV LAB',    diffOffset: 2, security: { monitor: 3, proxy: 3, firewall: 2 } },
      { serverType: 'PROTOTYPE',  diffOffset: 3, security: { monitor: 4, proxy: 3, firewall: 3 } },
    ],
  },
  {
    name: 'FROSTPEAK RESEARCH',
    stock: { ticker: 'FRPK', price: 103, volatility: 0.08 },
    baseDifficulty: 4,
    servers: [
      { serverType: 'PUBLIC',       diffOffset: 0, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'EXTERNAL',     diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 2 } },
      { serverType: 'INTERNAL',     diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'CRYO LAB',     diffOffset: 2, security: { monitor: 3, proxy: 3, firewall: 3 } },
      { serverType: 'DEEP ARCHIVE', diffOffset: 3, security: { monitor: 4, proxy: 3, firewall: 4 } },
    ],
  },
  {
    name: 'ECLIPSE MEDIA',
    stock: { ticker: 'ECLP', price: 52, volatility: 0.08 },
    baseDifficulty: 2,
    servers: [
      { serverType: 'PUBLIC',        diffOffset: 0, security: { monitor: 1, proxy: 0, firewall: 0 } },
      { serverType: 'EXTERNAL',      diffOffset: 1, security: { monitor: 1, proxy: 1, firewall: 1 } },
      { serverType: 'INTERNAL',      diffOffset: 2, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'BROADCAST',     diffOffset: 2, security: { monitor: 2, proxy: 2, firewall: 2 } },
      { serverType: 'CONTENT VAULT', diffOffset: 3, security: { monitor: 3, proxy: 2, firewall: 3 } },
    ],
  },
  {
    name: 'HARKEN PHARMA',
    stock: { ticker: 'HRKN', price: 141, volatility: 0.08 },
    baseDifficulty: 4,
    servers: [
      { serverType: 'PUBLIC',          diffOffset: 0, security: { monitor: 2, proxy: 1, firewall: 1 } },
      { serverType: 'EXTERNAL',        diffOffset: 1, security: { monitor: 2, proxy: 1, firewall: 2 } },
      { serverType: 'INTERNAL',        diffOffset: 2, security: { monitor: 3, proxy: 2, firewall: 2 } },
      { serverType: 'CLINICAL TRIALS', diffOffset: 2, security: { monitor: 3, proxy: 3, firewall: 2 } },
      { serverType: 'COMPOUND VAULT',  diffOffset: 3, security: { monitor: 4, proxy: 3, firewall: 4 } },
    ],
  },
];

// LOCAL COMPANIES -- player specific

export const localCompanies = [
  { name: 'ORBITAL RELAY STATION', baseDifficulty: 5, servers: localServers({ monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }, { monitor: 5, proxy: 4, firewall: 4 }) },
  { name: 'PORT AUTHORITY',        baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 1, firewall: 0 }, { monitor: 2, proxy: 1, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }) },
  { name: 'IRONWALL SECURITIES',   baseDifficulty: 5, servers: localServers({ monitor: 3, proxy: 2, firewall: 3 }, { monitor: 4, proxy: 3, firewall: 4 }, { monitor: 5, proxy: 4, firewall: 5 }) },
  { name: 'DELTA TRADING FLOOR',   baseDifficulty: 3, servers: localServers({ monitor: 2, proxy: 1, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }) },
  { name: 'STONEBRIDGE ARCHIVES',  baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 1, firewall: 1 }, { monitor: 2, proxy: 1, firewall: 2 }, { monitor: 3, proxy: 2, firewall: 2 }) },
  { name: 'BLACKWELL DATA CENTER', baseDifficulty: 3, servers: localServers({ monitor: 2, proxy: 1, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }) },
  { name: 'MERIDIAN TRANSIT',      baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 0, firewall: 1 }, { monitor: 2, proxy: 1, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }) },
  { name: 'COLDWATER NAVAL BASE',  baseDifficulty: 7, servers: localServers({ monitor: 4, proxy: 3, firewall: 3 }, { monitor: 5, proxy: 4, firewall: 4 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'FRONTLINE LOGISTICS',   baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 1, firewall: 1 }, { monitor: 2, proxy: 1, firewall: 2 }, { monitor: 3, proxy: 2, firewall: 3 }) },
  { name: 'AETHER COMMUNICATIONS', baseDifficulty: 3, servers: localServers({ monitor: 2, proxy: 1, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }) },
  { name: 'NOCTURNE INTELLIGENCE', baseDifficulty: 6, servers: localServers({ monitor: 3, proxy: 3, firewall: 3 }, { monitor: 4, proxy: 4, firewall: 4 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'PILGRIM AEROSPACE',     baseDifficulty: 4, servers: localServers({ monitor: 2, proxy: 2, firewall: 2 }, { monitor: 3, proxy: 3, firewall: 3 }, { monitor: 4, proxy: 4, firewall: 4 }) },
  { name: 'OBSIDIAN VAULT',        baseDifficulty: 7, servers: localServers({ monitor: 4, proxy: 3, firewall: 4 }, { monitor: 5, proxy: 4, firewall: 5 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'CRUX SATELLITE ARRAY',  baseDifficulty: 5, servers: localServers({ monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }, { monitor: 5, proxy: 4, firewall: 4 }) },
  { name: 'SYNAPSE NEUROTEC',      baseDifficulty: 4, servers: localServers({ monitor: 2, proxy: 2, firewall: 1 }, { monitor: 3, proxy: 3, firewall: 2 }, { monitor: 4, proxy: 4, firewall: 3 }) },
  { name: 'IRONCLAD ENFORCEMENT',  baseDifficulty: 5, servers: localServers({ monitor: 3, proxy: 2, firewall: 3 }, { monitor: 4, proxy: 3, firewall: 4 }, { monitor: 5, proxy: 4, firewall: 5 }) },
  { name: 'VEKTOR SURVEILLANCE',   baseDifficulty: 6, servers: localServers({ monitor: 3, proxy: 3, firewall: 3 }, { monitor: 4, proxy: 4, firewall: 4 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'SUNKEN ARCHIVE NODE',   baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 1, firewall: 1 }, { monitor: 2, proxy: 1, firewall: 2 }, { monitor: 3, proxy: 2, firewall: 3 }) },
  { name: 'GALLOWS POINT STATION', baseDifficulty: 3, servers: localServers({ monitor: 2, proxy: 1, firewall: 2 }, { monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }) },
  { name: 'DUSK PROTOCOL SERVER',  baseDifficulty: 4, servers: localServers({ monitor: 2, proxy: 2, firewall: 2 }, { monitor: 3, proxy: 3, firewall: 3 }, { monitor: 4, proxy: 4, firewall: 4 }) },
  { name: 'PHANTOM RELAY NODE',    baseDifficulty: 3, servers: localServers({ monitor: 2, proxy: 2, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }) },
  { name: 'KEYSTONE RAIL NETWORK', baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 1, firewall: 1 }, { monitor: 2, proxy: 1, firewall: 2 }, { monitor: 3, proxy: 2, firewall: 3 }) },
  { name: 'UMBRA INTELLIGENCE',    baseDifficulty: 7, servers: localServers({ monitor: 4, proxy: 3, firewall: 4 }, { monitor: 5, proxy: 4, firewall: 5 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'HOLLOW POINT ARMORY',   baseDifficulty: 4, servers: localServers({ monitor: 2, proxy: 2, firewall: 2 }, { monitor: 3, proxy: 3, firewall: 3 }, { monitor: 4, proxy: 4, firewall: 4 }) },
  { name: 'TRIDENT NAVAL COMMAND', baseDifficulty: 7, servers: localServers({ monitor: 4, proxy: 4, firewall: 4 }, { monitor: 5, proxy: 5, firewall: 4 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'MIRAGE CASINO NETWORK', baseDifficulty: 3, servers: localServers({ monitor: 2, proxy: 1, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }, { monitor: 4, proxy: 3, firewall: 3 }) },
  { name: 'SABLE COURIER SERVICE', baseDifficulty: 1, servers: localServers({ monitor: 1, proxy: 0, firewall: 0 }, { monitor: 1, proxy: 1, firewall: 1 }, { monitor: 2, proxy: 1, firewall: 2 }) },
  { name: 'WRAITH COMMUNICATIONS', baseDifficulty: 4, servers: localServers({ monitor: 2, proxy: 2, firewall: 2 }, { monitor: 3, proxy: 3, firewall: 2 }, { monitor: 4, proxy: 4, firewall: 3 }) },
  { name: 'DEADLOCK PRISON GRID',  baseDifficulty: 6, servers: localServers({ monitor: 3, proxy: 3, firewall: 3 }, { monitor: 4, proxy: 4, firewall: 4 }, { monitor: 5, proxy: 5, firewall: 5 }) },
  { name: 'SENTINEL WATCHTOWER',   baseDifficulty: 5, servers: localServers({ monitor: 3, proxy: 2, firewall: 3 }, { monitor: 4, proxy: 3, firewall: 4 }, { monitor: 5, proxy: 4, firewall: 5 }) },
  { name: 'NULLZONE BROADCAST HUB',baseDifficulty: 2, servers: localServers({ monitor: 1, proxy: 1, firewall: 1 }, { monitor: 2, proxy: 2, firewall: 1 }, { monitor: 3, proxy: 2, firewall: 2 }) },
];

// BANKS -- for banking system (yet to exist)

export const bankCompanies = [
  { name: 'NORDIC BANK',        difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'SOVEREIGN TRUST',    difficulty: 7, security: { monitor: 5, proxy: 3, firewall: 4 } },
  { name: 'HAVEN PRIVATE BANK', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 3 } },
  { name: 'WESTGATE FINANCIAL', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'GILDED EXCHANGE',    difficulty: 7, security: { monitor: 5, proxy: 3, firewall: 4 } },
];

// helpers

function localServers(pubSec, intSec, admSec) {
  return [
    { serverType: 'PUBLIC',   diffOffset: 0, security: pubSec },
    { serverType: 'INTERNAL', diffOffset: 1, security: intSec },
    { serverType: 'ADMIN',    diffOffset: 2, security: admSec },
  ];
}

export function flattenCompanies(globals, locals) {
  const flat = [];

  for (const company of globals) {
    for (const server of company.servers) {
      flat.push({
        company: company.name,
        serverType: server.serverType,
        name: `${company.name} // ${server.serverType}`,
        difficulty: Math.min(company.baseDifficulty + server.diffOffset, 9),
        security: server.security,
        isGlobal: true,
        ticker: company.stock.ticker,
      });
    }
  }

  for (const company of locals) {
    for (const server of company.servers) {
      flat.push({
        company: company.name,
        serverType: server.serverType,
        name: `${company.name} // ${server.serverType}`,
        difficulty: Math.min(company.baseDifficulty + server.diffOffset, 9),
        security: server.security,
        isGlobal: false,
      });
    }
  }

  return flat;
}

export function randomIp() {
  const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  return `${r(100, 255)}.${r(50, 100)}.${r(0, 50)}.${r(0, 255)}`;
}

export function assignIps(targets) {
  return targets.map(t => ({ ...t, ip: randomIp() }));
}

export function getByDifficulty(targets, min, max = min) {
  return targets.filter(t => t.difficulty >= min && t.difficulty <= max);
}