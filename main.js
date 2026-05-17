import { targets } from './company-names/companies.js';
import { titleScreen } from './titlescreen.js';
import { player, userCreation } from './user-js/user-creation.js';

class Target {
    constructor(title, ip) {
        this.title = title;
        this.ip = ip;
    }

    info() {
        return `${this.title} [${this.ip}]`;
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIp() {
    return `${random(100, 255)}.${random(50, 100)}.${random(0, 50)}.${random(0, 255)}`;
}

const targetList = targets.map(name => new Target(name, randomIp()));

await titleScreen();
await userCreation();