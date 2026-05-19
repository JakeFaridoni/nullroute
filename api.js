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

import {
    _ls_loadSaves,
    _ls_writeSaves,
    _ls_seedDefaultSave,
} from './saves.js';

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
    // ── local implementation ──
    const saves = _ls_loadSaves();
    const key = handle.toUpperCase();

    if (saves[key]) {
        return { ok: false, reason: 'HANDLE TAKEN' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const playerToSave = { ...playerTemplate, password: hashedPassword };

    saves[key] = { player: playerToSave, targets };
    _ls_writeSaves(saves);

    return { ok: true, player: playerToSave, targets };
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
    // ── local implementation ──
    const saves = _ls_loadSaves();
    const key = handle.toUpperCase();
    const save = saves[key];

    if (!save) {
        return { ok: false, reason: 'OPERATOR NOT FOUND' };
    }

    const valid = await bcrypt.compare(password, save.player.password);
    if (!valid) {
        return { ok: false, reason: 'INVALID CREDENTIALS' };
    }

    return { ok: true, player: save.player, targets: save.targets };
}

/**
 * Check whether a handle is already registered (used during registration flow).
 * Returns { exists: bool }
 *
 * BACKEND STUB: GET /auth/exists/:handle
 *               → 200 { exists: true|false }
 */
export async function apiHandleExists(handle) {
    // ── local implementation ──
    const saves = _ls_loadSaves();
    return { exists: !!saves[handle.toUpperCase()] };
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
    // ── local implementation ──
    const saves = _ls_loadSaves();
    const toSave = { ...player };

    // Only re-hash if the password arrived in plaintext (shouldn't happen after
    // login, but keeps the guard that was already in saves.js).
    if (toSave.password && !toSave.password.startsWith('$2')) {
        toSave.password = await bcrypt.hash(toSave.password, 10);
    }

    saves[player.handle] = { player: toSave, targets };
    _ls_writeSaves(saves);

    return { ok: true };
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
    // ── local implementation ──
    const saves = _ls_loadSaves();
    return saves[handle.toUpperCase()] ?? null;
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
    // ── local implementation (no-op passthrough) ──
    return { ok: true, targets: sessionTargets };
}

/**
 * Record a player action against a target (hit, exfil, destroy, etc.)
 * This is what will eventually mutate shared world state.
 *
 * BACKEND STUB: POST /world/action  { targetName, action, playerHandle }
 *               → 200 { ok: true, worldDelta: {...} }
 */
export async function apiRecordAction(playerHandle, targetName, action) {
    // ── local implementation (no-op) ──
    // Nothing to persist locally — world events only matter in a shared context.
    console.debug(`[api] action recorded locally (no-op): ${playerHandle} → ${action} on ${targetName}`);
    return { ok: true };
}

/**
 * Fetch the shared contract board.
 * Locally this is just the in-memory contractBoard — on the backend it will
 * be a server-managed list that all players see simultaneously.
 *
 * BACKEND STUB: GET /contracts
 *               → 200 { contracts: [...] }
 */
export async function apiGetContractBoard(contractBoard) {
    // ── local implementation (passthrough) ──
    return { ok: true, contracts: contractBoard };
}

/**
 * Accept a contract server-side (prevents two players claiming the same job).
 *
 * BACKEND STUB: POST /contracts/:id/accept  (authenticated)
 *               → 200 { ok: true, contract }
 *               → 409 { ok: false, reason: 'ALREADY ACCEPTED' }
 */
export async function apiAcceptContract(contractId, contractBoard, player, sessionTargets) {
    // ── local implementation — delegates to existing acceptContract logic ──
    // We import here (not at top-level) to avoid a circular dependency between
    // api.js → contracts.js → api.js.  A real backend call wouldn't need this.
    const { acceptContract } = await import('./contracts.js');
    return await acceptContract(contractId, sessionTargets);
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
    // ── local implementation (no-op) ──
    console.debug(`[api] broadcast (no-op locally):`, message, targetHandle ?? 'ALL');
    return { ok: true };
}

/**
 * Manually trigger a world event (bring a target offline, spike security, etc.)
 *
 * BACKEND STUB: POST /admin/world-event  { type, targetName, payload }  (admin JWT)
 *               → 200 { ok: true }
 */
export async function apiTriggerWorldEvent(type, targetName, payload = {}) {
    // ── local implementation (no-op) ──
    console.debug(`[api] world event (no-op locally): ${type} on ${targetName}`, payload);
    return { ok: true };
}

/**
 * Adjust a player's clearance or balance (GM action).
 *
 * BACKEND STUB: PATCH /admin/player/:handle  { clearance?, balance? }  (admin JWT)
 *               → 200 { ok: true, player }
 */
export async function apiAdjustPlayer(handle, delta = {}) {
    // ── local implementation ──
    const saves = _ls_loadSaves();
    const key = handle.toUpperCase();
    if (!saves[key]) return { ok: false, reason: 'OPERATOR NOT FOUND' };

    if (delta.clearance !== undefined) saves[key].player.clearance = delta.clearance;
    if (delta.balance   !== undefined) saves[key].player.balance   = delta.balance;

    _ls_writeSaves(saves);
    return { ok: true, player: saves[key].player };
}