// hardware.js

export const cpus = [
    { name: 'KEMTEC 80486DX', clockSpeed: 33, power: 1 },
    { name: 'KEMTEC 80486DX-2', clockSpeed: 66, power: 2 },
    { name: 'KEMTEC PENTIUM-60', clockSpeed: 60, power: 3 },
    { name: 'KEMTEC PENTIUM-90', clockSpeed: 90, power: 4 },
    { name: 'AXIOM P-133', clockSpeed: 133, power: 5 },
    { name: 'AXIOM P-166', clockSpeed: 166, power: 6 },
    { name: 'AXIOM P-200MMX', clockSpeed: 200, power: 7 },
    { name: 'CRUX ALPHA-300', clockSpeed: 300, power: 8 },
    { name: 'CRUX ALPHA-450', clockSpeed: 450, power: 9 },
    { name: 'CRUX ALPHA-600', clockSpeed: 600, power: 10 },
];

export const hdds = [
    { name: 'NORSTORE NS-251', totalSize: 80 },
    { name: 'NORSTORE NS-420', totalSize: 160 },
    { name: 'NORSTORE NS-840', totalSize: 320 },
    { name: 'VANTEC VX-1000', totalSize: 500 },
    { name: 'VANTEC VX-2000', totalSize: 1000 },
    { name: 'VANTEC VX-4000', totalSize: 2000 },
    { name: 'IRONCORE IC-8000', totalSize: 4000 },
    { name: 'IRONCORE IC-16000', totalSize: 8000 },
];

export const ramUpgrades = [
    { label: '+640K', amount: 640 },
    { label: '+1MB', amount: 1024 },
    { label: '+2MB', amount: 2048 },
    { label: '+4MB', amount: 4096 },
    { label: '+8MB', amount: 8192 },
];

export const bandwidthTiers = [
    { upload: 256, download: 512 }, // default
    { upload: 512, download: 1024 },
    { upload: 1024, download: 2048 },
    { upload: 2048, download: 4096 },
    { upload: 4096, download: 8192 },
];