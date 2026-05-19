export const targets = [
  { name: 'CRESTFIELD MAINFRAME', difficulty: 1, security: { monitor: 1, proxy: 0, firewall: 0 } },
  { name: 'NORDIC BANK VAULT', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'ORBITAL RELAY STATION', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 3 } },
  { name: 'PEMBROOK DEFENSE GRID', difficulty: 8, security: { monitor: 5, proxy: 4, firewall: 4 } },
  { name: 'AXIOM RESEARCH LAB', difficulty: 3, security: { monitor: 2, proxy: 1, firewall: 2 } },
  { name: 'HELIX BIOTECH SERVER', difficulty: 3, security: { monitor: 2, proxy: 2, firewall: 1 } },
  { name: 'PORT AUTHORITY NETWORK', difficulty: 2, security: { monitor: 2, proxy: 1, firewall: 0 } },
  { name: 'CASCADE POWER PLANT', difficulty: 5, security: { monitor: 3, proxy: 2, firewall: 3 } },
  { name: 'IRONWALL SECURITIES', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 4 } },
  { name: 'DELTA TRADING FLOOR', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'STONEBRIDGE ARCHIVES', difficulty: 2, security: { monitor: 1, proxy: 1, firewall: 1 } },
  { name: 'HARKEN PHARMA VAULT', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 2 } },
  { name: 'BLACKWELL DATA CENTER', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'SOVEREIGN TRUST BANK', difficulty: 7, security: { monitor: 5, proxy: 3, firewall: 4 } },
  { name: 'MERIDIAN TRANSIT HUB', difficulty: 2, security: { monitor: 2, proxy: 0, firewall: 1 } },
  { name: 'VECTOR ARMS FACILITY', difficulty: 7, security: { monitor: 4, proxy: 4, firewall: 4 } },
  { name: 'COLDWATER NAVAL BASE', difficulty: 9, security: { monitor: 5, proxy: 5, firewall: 4 } },
  { name: 'ECLIPSE MEDIA GROUP', difficulty: 2, security: { monitor: 1, proxy: 1, firewall: 1 } },
  { name: 'FRONTLINE LOGISTICS HQ', difficulty: 3, security: { monitor: 2, proxy: 1, firewall: 2 } },
  { name: 'AETHER COMMUNICATIONS', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'REDSTONE MINING CORP', difficulty: 2, security: { monitor: 1, proxy: 1, firewall: 1 } },
  { name: 'NOCTURNE INTELLIGENCE', difficulty: 8, security: { monitor: 5, proxy: 4, firewall: 5 } },
  { name: 'PILGRIM AEROSPACE', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 3 } },
  { name: 'OBSIDIAN VAULT', difficulty: 9, security: { monitor: 5, proxy: 5, firewall: 5 } },
  { name: 'CRUX SATELLITE ARRAY', difficulty: 7, security: { monitor: 4, proxy: 4, firewall: 3 } },
  { name: 'POLARIS ENERGY GRID', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 3 } },
  { name: 'SYNAPSE NEUROTEC LAB', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 2 } },
  { name: 'HAVEN PRIVATE BANK', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 3 } },
  { name: 'IRONCLAD ENFORCEMENT', difficulty: 7, security: { monitor: 5, proxy: 3, firewall: 4 } },
  { name: 'VEKTOR SURVEILLANCE NET', difficulty: 8, security: { monitor: 5, proxy: 4, firewall: 4 } },
  { name: 'SUNKEN ARCHIVE NODE', difficulty: 3, security: { monitor: 2, proxy: 1, firewall: 2 } },
  { name: 'GALLOWS POINT STATION', difficulty: 4, security: { monitor: 2, proxy: 2, firewall: 2 } },
  { name: 'CITADEL ARMS DEPOT', difficulty: 7, security: { monitor: 4, proxy: 4, firewall: 4 } },
  { name: 'ASHFORD MEDICAL CENTER', difficulty: 3, security: { monitor: 2, proxy: 1, firewall: 1 } },
  { name: 'DUSK PROTOCOL SERVER', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 3 } },
  { name: 'PHANTOM RELAY NODE', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 2 } },
  { name: 'KEYSTONE RAIL NETWORK', difficulty: 3, security: { monitor: 2, proxy: 1, firewall: 2 } },
  { name: 'UMBRA INTELLIGENCE HUB', difficulty: 9, security: { monitor: 5, proxy: 5, firewall: 4 } },
  { name: 'WESTGATE FINANCIAL', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'HOLLOW POINT ARMORY', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 3 } },
  { name: 'TRIDENT NAVAL COMMAND', difficulty: 9, security: { monitor: 5, proxy: 5, firewall: 5 } },
  { name: 'MIRAGE CASINO NETWORK', difficulty: 4, security: { monitor: 3, proxy: 2, firewall: 2 } },
  { name: 'SABLE COURIER SERVICE', difficulty: 2, security: { monitor: 1, proxy: 1, firewall: 1 } },
  { name: 'CRUCIBLE TECH CAMPUS', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 2 } },
  { name: 'FROSTPEAK RESEARCH BASE', difficulty: 6, security: { monitor: 4, proxy: 3, firewall: 3 } },
  { name: 'WRAITH COMMUNICATIONS', difficulty: 5, security: { monitor: 3, proxy: 3, firewall: 3 } },
  { name: 'GILDED EXCHANGE VAULT', difficulty: 7, security: { monitor: 5, proxy: 3, firewall: 4 } },
  { name: 'DEADLOCK PRISON GRID', difficulty: 8, security: { monitor: 5, proxy: 4, firewall: 4 } },
  { name: 'SENTINEL WATCHTOWER', difficulty: 7, security: { monitor: 5, proxy: 3, firewall: 4 } },
  { name: 'NULLZONE BROADCAST HUB', difficulty: 3, security: { monitor: 2, proxy: 2, firewall: 1 } },
];

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