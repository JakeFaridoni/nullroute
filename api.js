// api.js
// ─────────────────────────────────────────────────────────────────────────────
// Single interface between the game and its persistence / world layer.
//
// TODAY  → all methods delegate to localStorage via the helpers in saves.js.
// LATER  → swap each method body for a fetch() call to your real backend.
//          No other file in the project needs to change.
//
// Every method is async so callers are already written in the right style —
// the real backend will need to await network I/O, localStorage doesn't, but
// wrapping it in Promise.resolve() costs nothing.
// ─────────────────────────────────────────────────────────────────────────────


const BASE_URL = '/api';   // Nginx proxies /api/ → localhost:3001

function isAuthenticated() {
    return _token !== null;
}

// Token lives in memory only — never in localStorage.
// It is lost on page refresh, which means the player logs in again.
// That's intentional: it keeps credentials out of browser storage.
let _token = null;

function authHeader() {
    return _token ? { 'Authorization': `Bearer ${_token}` } : {};
}

async function apiFetch(path, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeader(),
                ...(options.headers ?? {}),
            },
        });
        return res.json();
    } catch (err) {
        console.warn(`[api] fetch failed: ${path}`, err);
        return { ok: false, reason: 'NETWORK ERROR' };
    }
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

/**
 * Register a new operator.
 * Returns { ok: true, player, targets } or { ok: false, reason }
 *
 * BACKEND STUB: POST /auth/register  { handle, password }
 *               → 201 { token, player, targets }
 *               → 409 { reason: 'HANDLE TAKEN' }
 */

export async function apiRegister(handle, password, playerTemplate, targets) {
    const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ handle, password, player: playerTemplate, targets }),
    });
    if (data.ok) _token = data.token;
    return data;
}

/**
 * Log in an existing operator.
 * Returns { ok: true, player, targets } or { ok: false, reason }
 *
 * BACKEND STUB: POST /auth/login  { handle, password }
 *               → 200 { token, player, targets }
 *               → 401 { reason: 'INVALID CREDENTIALS' }
 *               → 404 { reason: 'OPERATOR NOT FOUND' }
 */

export async function apiLogin(handle, password) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ handle, password }),
    });
    if (data.ok) _token = data.token;
    return data;
}

/**
 * Check whether a handle is already registered (used during registration flow).
 * Returns { exists: bool }
 *
 * BACKEND STUB: GET /auth/exists/:handle
 *               → 200 { exists: true|false }
 */

export async function apiHandleExists(handle) {
    return apiFetch(`/auth/exists/${encodeURIComponent(handle)}`);
}

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────

/**
 * Persist the current player state and session targets.
 * Fire-and-forget is fine for the local version; await it for the real backend.
 *
 * BACKEND STUB: PUT /save  { player, targets }  (authenticated via JWT header)
 *               → 200 { ok: true }
 */

export async function apiSaveGame(player, targets) {
    if (!isAuthenticated()) return { ok: false, reason: 'NOT LOGGED IN' };
    return apiFetch('/save', {
        method: 'PUT',
        body: JSON.stringify({ player, targets }),
    });
}

/**
 * Load a single save by handle (used after login to hydrate sessionTargets).
 * Returns the raw { player, targets } save object or null.
 *
 * BACKEND STUB: GET /save  (authenticated via JWT header)
 *               → 200 { player, targets }
 *               → 404 null
 */

export async function apiLoadSave(handle) {
    if(!isAuthenticated()) return null;
    const data = await apiFetch('/save');
    return data.ok ? { player: data.player, targets: data.targets } : null;
}

// ── WORLD STATE ───────────────────────────────────────────────────────────────
//
// These methods don't do anything yet — the local game has no shared world.
// They exist so you can start calling them from contracts.js / terminal.js
// now, and fill in real logic (both client-side and server-side) later without
// hunting for callsites.

/**
 * Fetch the current global target list with live world state
 * (security levels, online/offline status, hit counts, etc.)
 *
 * Returns the targets array.  Falls back to sessionTargets as-is locally.
 *
 * BACKEND STUB: GET /world/targets
 *               → 200 { targets: [...] }
 */

export async function apiGetWorldTargets(sessionTargets) {
    if (!isAuthenticated()) return { ok: false, reason: 'NOT LOGGED IN' };
    const data = await apiFetch('/world/targets');
    return data.ok ? { ok: true, targets: data.targets } : { ok: true, targets: sessionTargets };
}

/**
 * Record a player action against a target (hit, exfil, destroy, etc.)
 * This is what will eventually mutate shared world state.
 *
 * BACKEND STUB: POST /world/action  { targetName, action, playerHandle }
 *               → 200 { ok: true, worldDelta: {...} }
 */

export async function apiRecordAction(playerHandle, targetName, action, outcome = 'SUCCESS') {
    if (!isAuthenticated()) return { ok: false, reason: 'NOT LOGGED IN' };
    return apiFetch('/world/action', {
        method: 'POST',
        body: JSON.stringify({ targetName, action, outcome }),
    });
}

/**
 * Fetch the shared contract board.
 * Locally this is just the in-memory contractBoard — on the backend it will
 * be a server-managed list that all players see simultaneously.
 *
 * BACKEND STUB: GET /contracts
 *               → 200 { contracts: [...] }
 */

export async function apiGetContractBoard() {
    const data = await apiFetch('/contracts');
    return data.ok ? { ok: true, contracts: data.contracts } : { ok: true, contracts: [] };
}

/**
 * Accept a contract server-side (prevents two players claiming the same job).
 *
 * BACKEND STUB: POST /contracts/:id/accept  (authenticated)
 *               → 200 { ok: true, contract }
 *               → 409 { ok: false, reason: 'ALREADY ACCEPTED' }
 */

export async function apiAcceptContract(contractId) {
    return apiFetch(`/contracts/${contractId}/accept`, { method: 'POST' });
}

// ── ADMIN / GM ────────────────────────────────────────────────────────────────
//
// Game-master operations.  All no-ops locally; the GM dashboard will call
// these against the real backend.

/**
 * Broadcast an inbox message to all players (or a specific handle).
 *
 * BACKEND STUB: POST /admin/broadcast  { message, targetHandle? }  (admin JWT)
 *               → 200 { ok: true, delivered: number }
 */

export async function apiBroadcastMessage(message, targetHandle = null) {
    return apiFetch('/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message, targetHandle }),
    });
}

/**
 * Manually trigger a world event (bring a target offline, spike security, etc.)
 *
 * BACKEND STUB: POST /admin/world-event  { type, targetName, payload }  (admin JWT)
 *               → 200 { ok: true }
 */

export async function apiTriggerWorldEvent(type, targetName, payload = {}) {
    return apiFetch('/admin/world-event', {
        method: 'POST',
        body: JSON.stringify({ type, targetName, payload }),
    });
}

/**
 * Adjust a player's clearance or balance (GM action).
 *
 * BACKEND STUB: PATCH /admin/player/:handle  { clearance?, balance? }  (admin JWT)
 *               → 200 { ok: true, player }
 */

export async function apiAdjustPlayer(handle, delta = {}) {
    return apiFetch(`/admin/operators/${encodeURIComponent(handle)}`, {
        method: 'PATCH',
        body: JSON.stringify(delta),
    });
}
