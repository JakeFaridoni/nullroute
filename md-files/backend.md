# NULLROUTE — Backend Setup Guide
### Ubuntu Server · Local-first → Public later · Monitor + keyboard

---

## Overview

You're going from a bare machine to a fully running NULLROUTE backend.
The work splits into five phases — each one leaves you at a testable,
working state before moving on.

| Phase | What you're doing                          | Game playable? |
|-------|--------------------------------------------|----------------|
| 1     | Install Ubuntu Server on the spare machine | Yes (localStorage still) |
| 2     | Install Node, Postgres, and project files  | Yes (localStorage still) |
| 3     | Build the Express API                      | Yes (localStorage still) |
| 4     | Swap api.js to use fetch()                 | Brief downtime |
| 5     | Go public (port forward + domain + HTTPS)  | Whenever you're ready |

---

## Phase 1 — Install Ubuntu Server

### 1.1 Download the ISO

On your main machine, go to:
https://ubuntu.com/download/server

Download the latest **Ubuntu Server LTS** (the one labelled LTS, currently 24.04).
You want the Server edition, not Desktop — it has no GUI, which means less
resource usage on limited hardware, and it's what every tutorial assumes for
self-hosted servers.

### 1.2 Flash it to a USB drive

You need a USB drive of at least 4GB. Everything on it will be erased.

Download **Balena Etcher**: https://etcher.balena.io
- Select the Ubuntu ISO you downloaded
- Select your USB drive
- Click Flash

### 1.3 Boot from USB

- Plug the USB into the spare machine
- Power it on and enter the boot menu (usually F12, F2, or DEL — depends on
  the machine, it'll say on the POST screen)
- Select the USB drive as the boot device

### 1.4 Install Ubuntu Server

The installer is text-based but straightforward. Here are the choices that matter:

**Language / keyboard:** pick yours.

**Network:** the installer will detect your network adapter. If it gets an IP
automatically (DHCP) you'll see something like `192.168.x.x` — that's fine for
now. Note this IP address down, you'll use it to access the server from your
main machine later.

**Storage:** choose "Use an entire disk" unless you have a reason not to.
Enable LVM when offered — it makes resizing partitions easier later.

**Profile setup:**
- Your name: anything
- Server name: `nullroute-server` (or whatever you like)
- Username: pick something, e.g. `nullroute`
- Password: pick something strong, write it down

**OpenSSH:** when the installer asks "Install OpenSSH server?" — **say yes**.
This lets you SSH in from your main machine later so you don't always need the
monitor.

**Featured snaps:** skip all of these, just hit Done.

The install takes 5–15 minutes. When it finishes it will ask you to remove the
USB and press Enter. Do that — the machine will reboot into Ubuntu.

### 1.5 First login

You'll see a text login prompt. Log in with the username and password you set.

Run a full update before doing anything else:

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

Log back in after the reboot. You're done with Phase 1.

---

## Phase 2 — Install Dependencies

### 2.1 Install Node.js

Ubuntu's default Node package is outdated. Use the NodeSource script to get
the current LTS version:

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # should print v20.x.x or higher
npm -v
```

### 2.2 Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Now create the database and a dedicated user for NULLROUTE:

```bash
sudo -u postgres psql
```

You're now inside the Postgres shell. Run these commands:

```sql
CREATE DATABASE nullroute;
CREATE USER nullroute_user WITH PASSWORD 'pick_a_strong_password';
GRANT ALL PRIVILEGES ON DATABASE nullroute TO nullroute_user;
\c nullroute
GRANT ALL ON SCHEMA public TO nullroute_user;
\q
```

Test the connection:

```bash
psql -U nullroute_user -d nullroute -h localhost
```

You should see a `nullroute=>` prompt. Type `\q` to exit.

### 2.3 Install PM2

PM2 keeps your Node server alive after you log out, and restarts it if it
crashes:

```bash
sudo npm install -g pm2
pm2 startup
```

The `pm2 startup` command prints a line starting with `sudo env PATH=...` —
**copy and run that exact line**. It registers PM2 as a system service.

### 2.4 Set up the project directories

```bash
sudo mkdir -p /srv/nullroute-server
sudo chown $USER:$USER /srv/nullroute-server

sudo mkdir -p /srv/nullroute-game
sudo chown $USER:$USER /srv/nullroute-game
```

`nullroute-server` is where the Express API lives.
`nullroute-game` is where the game's frontend files (your current project) live.

### 2.5 Get your game files onto the server

**If you're using Git** (easiest going forward):

```bash
sudo apt install -y git
git clone https://github.com/YOUR_USERNAME/nullroute.git /srv/nullroute-game
```

**If you're not using Git**, copy from your main machine over the network.
First find the server's local IP:

```bash
ip a | grep "inet " | grep -v 127.0.0.1
# look for something like 192.168.1.x
```

Then on your **main machine** (not the server):

```bash
scp -r /path/to/your/nullroute/project nullroute@192.168.1.x:/srv/nullroute-game
```

### 2.6 Install Nginx (to serve the game frontend)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Create a site config for the game:

```bash
sudo nano /etc/nginx/sites-available/nullroute
```

Paste this — replacing `192.168.1.x` with your server's actual local IP:

```nginx
server {
    listen 80;
    server_name 192.168.1.x;

    # Serve the game frontend
    root /srv/nullroute-game;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the Node server
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/nullroute /etc/nginx/sites-enabled/
sudo nginx -t        # should print "syntax is ok"
sudo systemctl reload nginx
```

On your **main machine**, open a browser and go to `http://192.168.1.x`
(use your server's actual IP). You should see the NULLROUTE title screen —
still running on localStorage at this point, but being served from the spare
machine.

---

## Phase 3 — Build the Express API

All of this work happens in `/srv/nullroute-server`.

### 3.1 Initialise the project

```bash
cd /srv/nullroute-server
npm init -y
npm install express pg bcryptjs jsonwebtoken cors dotenv
```

Open `package.json` and add `"type": "module"` so ES imports work:

```json
{
  "type": "module",
  "name": "nullroute-server",
  ...
}
```

### 3.2 Environment file

```bash
nano /srv/nullroute-server/.env
```

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nullroute
DB_USER=nullroute_user
DB_PASSWORD=pick_a_strong_password
JWT_SECRET=paste_a_long_random_string_here
JWT_EXPIRES_IN=30d
```

Generate the JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output and paste it as the value of `JWT_SECRET`.

If you're using Git, add `.env` to `.gitignore` now — never commit it.

### 3.3 Database schema

```bash
nano /srv/nullroute-server/schema.sql
```

```sql
CREATE TABLE operators (
    handle          TEXT PRIMARY KEY,
    id              TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    clearance       INT  DEFAULT 0,
    balance         INT  DEFAULT 3000,
    affiliation     TEXT DEFAULT 'FREELANCER',
    tools           JSONB DEFAULT '[]',
    installed_files JSONB DEFAULT '[]',
    hardware        JSONB NOT NULL,
    trace_buffer    INT  DEFAULT 30000,
    log             JSONB DEFAULT '[]',
    inbox           JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_seen       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE operator_targets (
    handle  TEXT PRIMARY KEY REFERENCES operators(handle) ON DELETE CASCADE,
    targets JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE world_targets (
    name             TEXT PRIMARY KEY,
    difficulty       INT  NOT NULL,
    base_security    JSONB NOT NULL,
    current_security JSONB NOT NULL,
    ip               TEXT NOT NULL,
    status           TEXT DEFAULT 'ONLINE',
    offline_until    TIMESTAMPTZ,
    hit_count        INT  DEFAULT 0,
    last_hit_by      TEXT
);

CREATE TABLE world_events (
    id          SERIAL PRIMARY KEY,
    handle      TEXT NOT NULL,
    target_name TEXT NOT NULL,
    action      TEXT NOT NULL,
    outcome     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contracts (
    id          TEXT PRIMARY KEY,
    objective   TEXT NOT NULL,
    description TEXT NOT NULL,
    target_name TEXT NOT NULL,
    target_ip   TEXT NOT NULL,
    difficulty  INT  NOT NULL,
    security    JSONB NOT NULL,
    payout      INT  NOT NULL,
    status      TEXT DEFAULT 'AVAILABLE',
    accepted_by TEXT,
    accepted_at TIMESTAMPTZ,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Apply it:

```bash
psql -U nullroute_user -d nullroute -h localhost -f /srv/nullroute-server/schema.sql
```

### 3.4 Database connection helper

```bash
nano /srv/nullroute-server/db.js
```

```javascript
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

export const db = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
```

### 3.5 Auth middleware

```bash
mkdir /srv/nullroute-server/middleware
nano /srv/nullroute-server/middleware/auth.js
```

```javascript
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, reason: 'NO TOKEN' });
    }
    try {
        req.operator = jwt.verify(header.slice(7), process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ ok: false, reason: 'INVALID TOKEN' });
    }
}

export function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.operator.affiliation !== 'NULLROUTE') {
            return res.status(403).json({ ok: false, reason: 'FORBIDDEN' });
        }
        next();
    });
}
```

### 3.6 Routes

```bash
mkdir /srv/nullroute-server/routes
```

**Auth routes** — `nano /srv/nullroute-server/routes/auth.js`

```javascript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const authRouter = Router();

// POST /auth/register
authRouter.post('/register', async (req, res) => {
    const { handle, password, player, targets } = req.body;
    const key = handle.toUpperCase();

    try {
        const existing = await db.query(
            'SELECT handle FROM operators WHERE handle = $1', [key]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ ok: false, reason: 'HANDLE TAKEN' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await db.query(`
            INSERT INTO operators
              (handle, id, password_hash, clearance, balance, affiliation,
               tools, installed_files, hardware, trace_buffer, log, inbox)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        `, [
            key,
            player.id,
            password_hash,
            player.clearance,
            player.balance,
            player.affiliation,
            JSON.stringify(player.tools),
            JSON.stringify(player.installedFiles),
            JSON.stringify(player.hardware),
            player.traceBuffer,
            JSON.stringify(player.log),
            JSON.stringify(player.inbox),
        ]);

        await db.query(
            'INSERT INTO operator_targets (handle, targets) VALUES ($1, $2)',
            [key, JSON.stringify(targets)]
        );

        const token = jwt.sign(
            { handle: key, affiliation: player.affiliation },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(201).json({ ok: true, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});

// POST /auth/login
authRouter.post('/login', async (req, res) => {
    const { handle, password } = req.body;
    const key = handle.toUpperCase();

    try {
        const result = await db.query(
            'SELECT * FROM operators WHERE handle = $1', [key]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, reason: 'OPERATOR NOT FOUND' });
        }

        const row = result.rows[0];
        const valid = await bcrypt.compare(password, row.password_hash);
        if (!valid) {
            return res.status(401).json({ ok: false, reason: 'INVALID CREDENTIALS' });
        }

        const targetsResult = await db.query(
            'SELECT targets FROM operator_targets WHERE handle = $1', [key]
        );

        await db.query(
            'UPDATE operators SET last_seen = NOW() WHERE handle = $1', [key]
        );

        const token = jwt.sign(
            { handle: key, affiliation: row.affiliation },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const player = rowToPlayer(row);

        return res.json({
            ok: true,
            token,
            player,
            targets: targetsResult.rows[0]?.targets ?? [],
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});

// GET /auth/exists/:handle
authRouter.get('/exists/:handle', async (req, res) => {
    const key = req.params.handle.toUpperCase();
    const result = await db.query(
        'SELECT handle FROM operators WHERE handle = $1', [key]
    );
    res.json({ exists: result.rows.length > 0 });
});

// ── helper ────────────────────────────────────────────────────────────────────

function rowToPlayer(row) {
    return {
        handle:         row.handle,
        id:             row.id,
        clearance:      row.clearance,
        balance:        row.balance,
        affiliation:    row.affiliation,
        tools:          row.tools,
        installedFiles: row.installed_files,
        hardware:       row.hardware,
        traceBuffer:    row.trace_buffer,
        log:            row.log,
        inbox:          row.inbox,
    };
}
```

**Save routes** — `nano /srv/nullroute-server/routes/save.js`

```javascript
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const saveRouter = Router();

// PUT /save  — persist current player state
saveRouter.put('/', requireAuth, async (req, res) => {
    const { player, targets } = req.body;
    const handle = req.operator.handle;

    try {
        await db.query(`
            UPDATE operators SET
                clearance       = $1,
                balance         = $2,
                affiliation     = $3,
                tools           = $4,
                installed_files = $5,
                hardware        = $6,
                trace_buffer    = $7,
                log             = $8,
                inbox           = $9,
                last_seen       = NOW()
            WHERE handle = $10
        `, [
            player.clearance,
            player.balance,
            player.affiliation,
            JSON.stringify(player.tools),
            JSON.stringify(player.installedFiles),
            JSON.stringify(player.hardware),
            player.traceBuffer,
            JSON.stringify(player.log),
            JSON.stringify(player.inbox),
            handle,
        ]);

        await db.query(`
            INSERT INTO operator_targets (handle, targets)
            VALUES ($1, $2)
            ON CONFLICT (handle) DO UPDATE SET targets = $2
        `, [handle, JSON.stringify(targets)]);

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});

// GET /save  — load current player state (called after login)
saveRouter.get('/', requireAuth, async (req, res) => {
    const handle = req.operator.handle;

    try {
        const opResult = await db.query(
            'SELECT * FROM operators WHERE handle = $1', [handle]
        );
        const tgResult = await db.query(
            'SELECT targets FROM operator_targets WHERE handle = $1', [handle]
        );

        if (opResult.rows.length === 0) {
            return res.status(404).json({ ok: false, reason: 'NOT FOUND' });
        }

        const row = opResult.rows[0];
        res.json({
            ok: true,
            player: {
                handle:         row.handle,
                id:             row.id,
                clearance:      row.clearance,
                balance:        row.balance,
                affiliation:    row.affiliation,
                tools:          row.tools,
                installedFiles: row.installed_files,
                hardware:       row.hardware,
                traceBuffer:    row.trace_buffer,
                log:            row.log,
                inbox:          row.inbox,
            },
            targets: tgResult.rows[0]?.targets ?? [],
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});
```

**World routes** — `nano /srv/nullroute-server/routes/world.js`

```javascript
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const worldRouter = Router();

// GET /world/targets
worldRouter.get('/targets', requireAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM world_targets ORDER BY difficulty');
        res.json({ ok: true, targets: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});

// POST /world/action
worldRouter.post('/action', requireAuth, async (req, res) => {
    const { targetName, action, outcome } = req.body;
    const handle = req.operator.handle;

    try {
        await db.query(`
            INSERT INTO world_events (handle, target_name, action, outcome)
            VALUES ($1, $2, $3, $4)
        `, [handle, targetName, action, outcome]);

        // If the action succeeded, update world target state
        if (outcome === 'SUCCESS') {
            if (action === 'DESTROY') {
                const offlineUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
                await db.query(`
                    UPDATE world_targets
                    SET status = 'OFFLINE', offline_until = $1,
                        last_hit_by = $2, hit_count = hit_count + 1
                    WHERE name = $3
                `, [offlineUntil, handle, targetName]);
            } else {
                await db.query(`
                    UPDATE world_targets
                    SET last_hit_by = $1, hit_count = hit_count + 1
                    WHERE name = $2
                `, [handle, targetName]);
            }
        }

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});
```

**Contract routes** — `nano /srv/nullroute-server/routes/contracts.js`

```javascript
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const contractRouter = Router();

// GET /contracts
contractRouter.get('/', requireAuth, async (req, res) => {
    try {
        await db.query(`
            UPDATE contracts SET status = 'EXPIRED'
            WHERE status = 'AVAILABLE' AND expires_at < NOW()
        `);

        const result = await db.query(`
            SELECT * FROM contracts
            WHERE status != 'EXPIRED'
            ORDER BY difficulty
        `);

        res.json({ ok: true, contracts: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});

// POST /contracts/:id/accept
contractRouter.post('/:id/accept', requireAuth, async (req, res) => {
    const handle = req.operator.handle;
    const id = req.params.id;

    try {
        const result = await db.query(
            'SELECT * FROM contracts WHERE id = $1', [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ ok: false, reason: 'CONTRACT NOT FOUND' });
        }

        const contract = result.rows[0];

        if (contract.status !== 'AVAILABLE') {
            return res.status(409).json({ ok: false, reason: `CONTRACT IS ${contract.status}` });
        }

        await db.query(`
            UPDATE contracts
            SET status = 'ACCEPTED', accepted_by = $1, accepted_at = NOW()
            WHERE id = $2
        `, [handle, id]);

        res.json({ ok: true, contract: { ...contract, status: 'ACCEPTED', accepted_by: handle } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});
```

**Admin routes** — `nano /srv/nullroute-server/routes/admin.js`

```javascript
import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

// GET /admin/operators  — list all operators
adminRouter.get('/operators', requireAdmin, async (req, res) => {
    const result = await db.query(
        'SELECT handle, id, clearance, balance, affiliation, last_seen FROM operators ORDER BY last_seen DESC'
    );
    res.json({ ok: true, operators: result.rows });
});

// PATCH /admin/operators/:handle  — adjust clearance or balance
adminRouter.patch('/operators/:handle', requireAdmin, async (req, res) => {
    const key = req.params.handle.toUpperCase();
    const { clearance, balance } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (clearance !== undefined) { fields.push(`clearance = $${i++}`); values.push(clearance); }
    if (balance   !== undefined) { fields.push(`balance = $${i++}`);   values.push(balance); }

    if (fields.length === 0) {
        return res.status(400).json({ ok: false, reason: 'NOTHING TO UPDATE' });
    }

    values.push(key);
    await db.query(
        `UPDATE operators SET ${fields.join(', ')} WHERE handle = $${i}`,
        values
    );
    res.json({ ok: true });
});

// POST /admin/broadcast  — push a message to all operators (or one)
// This inserts directly into the operator's inbox JSONB column.
adminRouter.post('/broadcast', requireAdmin, async (req, res) => {
    const { message, targetHandle } = req.body;

    try {
        if (targetHandle) {
            await db.query(`
                UPDATE operators
                SET inbox = inbox || $1::jsonb
                WHERE handle = $2
            `, [JSON.stringify([message]), targetHandle.toUpperCase()]);
        } else {
            await db.query(`
                UPDATE operators
                SET inbox = inbox || $1::jsonb
                WHERE affiliation != 'NULLROUTE'
            `, [JSON.stringify([message])]);
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});

// POST /admin/world-event  — manually trigger a world state change
adminRouter.post('/world-event', requireAdmin, async (req, res) => {
    const { type, targetName, payload } = req.body;

    try {
        if (type === 'OFFLINE') {
            const duration = payload.durationHours ?? 1;
            const until = new Date(Date.now() + duration * 60 * 60 * 1000);
            await db.query(`
                UPDATE world_targets SET status = 'OFFLINE', offline_until = $1
                WHERE name = $2
            `, [until, targetName]);
        } else if (type === 'ONLINE') {
            await db.query(`
                UPDATE world_targets SET status = 'ONLINE', offline_until = NULL
                WHERE name = $1
            `, [targetName]);
        } else if (type === 'HARDEN') {
            await db.query(`
                UPDATE world_targets SET status = 'HARDENED',
                current_security = jsonb_build_object(
                    'monitor', (base_security->>'monitor')::int + 1,
                    'proxy',   (base_security->>'proxy')::int + 1,
                    'firewall',(base_security->>'firewall')::int + 1
                )
                WHERE name = $1
            `, [targetName]);
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, reason: 'SERVER ERROR' });
    }
});
```

### 3.7 Server entry point

```bash
nano /srv/nullroute-server/server.js
```

```javascript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter }     from './routes/auth.js';
import { saveRouter }     from './routes/save.js';
import { worldRouter }    from './routes/world.js';
import { contractRouter } from './routes/contracts.js';
import { adminRouter }    from './routes/admin.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/auth',      authRouter);
app.use('/save',      saveRouter);
app.use('/world',     worldRouter);
app.use('/contracts', contractRouter);
app.use('/admin',     adminRouter);

app.get('/health', (_, res) => res.json({ ok: true, status: 'GRID ONLINE' }));

app.listen(process.env.PORT, () => {
    console.log(`NULLROUTE API online — port ${process.env.PORT}`);
});
```

### 3.8 Start the server

```bash
cd /srv/nullroute-server
pm2 start server.js --name nullroute-api
pm2 save    # persists the process list across reboots
```

Test it from your **main machine**:

```
http://192.168.1.x/api/health
```

You should get: `{"ok":true,"status":"GRID ONLINE"}`

---

## Phase 4 — Wire api.js to the Backend

Now you swap the internals of `api.js` from `_ls_*` calls to `fetch()` calls.
This is the only file that changes. Everything else in the game is untouched.

### 4.1 Token storage

Add this small helper at the top of `api.js`, replacing the imports from
`saves.js`:

```javascript
// api.js — top of file, replacing the _ls_ imports

const BASE_URL = '/api';   // Nginx proxies /api/ → localhost:3001

// Token lives in memory only — never in localStorage.
// It is lost on page refresh, which means the player logs in again.
// That's intentional: it keeps credentials out of browser storage.
let _token = null;

function authHeader() {
    return _token ? { 'Authorization': `Bearer ${_token}` } : {};
}

async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
            ...(options.headers ?? {}),
        },
    });
    return res.json();
}
```

### 4.2 Replace each method body

Swap the implementations in `api.js` one by one. The function signatures and
return shapes stay identical — only the bodies change.

```javascript
export async function apiRegister(handle, password, playerTemplate, targets) {
    const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ handle, password, player: playerTemplate, targets }),
    });
    if (data.ok) _token = data.token;
    return data;
}

export async function apiLogin(handle, password) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ handle, password }),
    });
    if (data.ok) _token = data.token;
    return data;
}

export async function apiHandleExists(handle) {
    return apiFetch(`/auth/exists/${encodeURIComponent(handle)}`);
}

export async function apiSaveGame(player, targets) {
    return apiFetch('/save', {
        method: 'PUT',
        body: JSON.stringify({ player, targets }),
    });
}

export async function apiLoadSave(handle) {
    const data = await apiFetch('/save');
    return data.ok ? { player: data.player, targets: data.targets } : null;
}

export async function apiGetWorldTargets(sessionTargets) {
    const data = await apiFetch('/world/targets');
    return data.ok ? { ok: true, targets: data.targets } : { ok: true, targets: sessionTargets };
}

export async function apiRecordAction(playerHandle, targetName, action, outcome = 'SUCCESS') {
    return apiFetch('/world/action', {
        method: 'POST',
        body: JSON.stringify({ targetName, action, outcome }),
    });
}

export async function apiGetContractBoard() {
    const data = await apiFetch('/contracts');
    return data.ok ? { ok: true, contracts: data.contracts } : { ok: true, contracts: [] };
}

export async function apiAcceptContract(contractId) {
    return apiFetch(`/contracts/${contractId}/accept`, { method: 'POST' });
}

export async function apiBroadcastMessage(message, targetHandle = null) {
    return apiFetch('/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message, targetHandle }),
    });
}

export async function apiTriggerWorldEvent(type, targetName, payload = {}) {
    return apiFetch('/admin/world-event', {
        method: 'POST',
        body: JSON.stringify({ type, targetName, payload }),
    });
}

export async function apiAdjustPlayer(handle, delta = {}) {
    return apiFetch(`/admin/operators/${encodeURIComponent(handle)}`, {
        method: 'PATCH',
        body: JSON.stringify(delta),
    });
}
```

### 4.3 Seed the NIX and ADMIN operators in the database

The `seedDefaultSave()` function in `saves.js` no longer has anything to seed
into localStorage. You now need those two special operators in Postgres instead.
Run this once:

```bash
cd /srv/nullroute-server
node -e "
import('bcryptjs').then(async ({ default: bcrypt }) => {
    const nixHash   = await bcrypt.hash('NULLROUTE', 10);
    const adminHash = await bcrypt.hash('NULLROUTE', 10);
    console.log('NIX:  ', nixHash);
    console.log('ADMIN:', adminHash);
});
"
```

Copy the two hashes, then open psql and insert:

```sql
INSERT INTO operators
  (handle, id, password_hash, clearance, balance, affiliation, tools,
   installed_files, hardware, trace_buffer, log, inbox)
VALUES
  ('NIX', 'NR-0001', 'PASTE_NIX_HASH_HERE', 10, 999999, 'NULLROUTE',
   '[{"name":"portScan","level":5,"ramUsage":120,"size":10,"active":false},
     {"name":"passCrack","level":5,"ramUsage":320,"size":15,"active":false},
     {"name":"connect","level":5,"ramUsage":0,"size":5,"active":false}]',
   '[]',
   '{"cpu":{"name":"CRUX ALPHA-600","clockSpeed":600,"power":10},
     "ram":{"totalRAM":16384},
     "storage":{"name":"IRONCORE IC-16000","totalSize":8000},
     "bandwidth":{"upload":4096,"download":8192}}',
   1800000, '[]', '[]'),

  ('ADMIN', 'NR-9999', 'PASTE_ADMIN_HASH_HERE', 10, 999999, 'NULLROUTE',
   '[{"name":"portScan","level":5,"ramUsage":120,"size":10,"active":false},
     {"name":"passCrack","level":5,"ramUsage":320,"size":15,"active":false},
     {"name":"connect","level":5,"ramUsage":0,"size":5,"active":false}]',
   '[]',
   '{"cpu":{"name":"CRUX ALPHA-600","clockSpeed":600,"power":10},
     "ram":{"totalRAM":16384},
     "storage":{"name":"IRONCORE IC-16000","totalSize":8000},
     "bandwidth":{"upload":4096,"download":8192}}',
   1800000, '[]', '[]');
```

### 4.4 Deploy and test

Push the updated game files to `/srv/nullroute-game` (git pull, or scp again),
then reload Nginx:

```bash
sudo systemctl reload nginx
```

Open the game in your browser, register a new operator, and verify the save
appears in Postgres:

```bash
psql -U nullroute_user -d nullroute -h localhost -c "SELECT handle, id, clearance, balance FROM operators;"
```

---

## Phase 5 — Going Public (do this whenever you're ready)

This phase is self-contained. Your game already works on the local network
before you touch any of this.

### 5.1 Get a domain name

Buy a domain from Namecheap, Cloudflare Registrar, or similar (~$10/year).
Cloudflare Registrar is recommended because you'll use Cloudflare for DNS
management anyway.

### 5.2 Port forwarding

On your home router (usually accessed at `192.168.1.1`):
- Forward external port **80** → your server's local IP, port 80
- Forward external port **443** → your server's local IP, port 443

Every router's interface is different — search for your router model + "port
forwarding" if needed. Find your home's public IP at https://ifconfig.me

### 5.3 Point your domain at your IP

In Cloudflare (or your DNS provider), add an A record:
- Name: `@` (or `nullroute`, for a subdomain)
- Value: your public IP from step 5.2
- Proxy: **DNS only** (grey cloud) for now

### 5.4 Set up HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot will edit your Nginx config automatically and set up auto-renewal.

### 5.5 Update api.js BASE_URL

```javascript
// Change this line in api.js:
const BASE_URL = '/api';
// to:
const BASE_URL = 'https://yourdomain.com/api';
```

Or keep it as `/api` if the game is served from the same domain — which it
will be if Nginx is serving both the frontend and proxying the API on the
same server.

### 5.6 Static IP considerations

Home IPs can change. Two options to handle this:
- **Cloudflare Tunnel** (free) — removes the need for port forwarding entirely
  and handles the dynamic IP problem automatically. Worth looking into.
- **Dynamic DNS** — a small script that updates your DNS record whenever your
  IP changes. Most routers have this built in.

---

## Quick Reference — Useful Commands

```bash
# Check API server status
pm2 status

# View live API logs
pm2 logs nullroute-api

# Restart the API after code changes
pm2 restart nullroute-api

# Connect to the database
psql -U nullroute_user -d nullroute -h localhost

# List all operators
psql -U nullroute_user -d nullroute -h localhost -c "SELECT handle, clearance, balance, last_seen FROM operators;"

# Reload Nginx after config changes
sudo systemctl reload nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```