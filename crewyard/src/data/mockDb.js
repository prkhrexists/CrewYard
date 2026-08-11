import { mockAsks, mockUsers, mockStats } from "./mockData.js";

// ─────────────────────────────────────────────────────────────
//  In-memory "database" — seeded from mockData, mutable for the session
// ─────────────────────────────────────────────────────────────
let _asks = mockAsks.map((a) => ({ ...a }));          // shallow copy so mockData stays pristine
const _users = mockUsers.map((u) => ({ ...u }));      // read-only in practice; copy for safety

// Simulated current authenticated user (null = logged out)
// AuthContext sets this externally via setCurrentUser()
let _currentUserId = null;

/** Called by AuthContext to sync the logged-in user id into the module. */
export function setCurrentUser(userId) {
  _currentUserId = userId;
}

// ─────────────────────────────────────────────────────────────
//  Utility
// ─────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(300 + Math.random() * 300); // 300–600 ms
}

// ─────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────

/**
 * Returns all asks, optionally filtered by type.
 * @param {"help"|"teammate"|"build_log"|undefined} filterByType
 */
export async function getAsks(filterByType) {
  await randomDelay();
  if (!filterByType) return [..._asks];
  return _asks.filter((a) => a.type === filterByType);
}

/**
 * Returns a single ask by id, or null if not found.
 */
export async function getAskById(id) {
  await randomDelay();
  return _asks.find((a) => a.id === id) ?? null;
}

/**
 * Creates a new ask and appends it to the in-memory list.
 * The caller should provide all required fields except `id`, `createdAt`,
 * `commentCount`, `likeCount`, and `saved` — those are set here.
 * @param {Omit<import("./mockData").Ask, "id"|"createdAt"|"commentCount"|"likeCount"|"saved">} newAsk
 */
export async function createAsk(newAsk) {
  await randomDelay();
  const ask = {
    id: `a${Date.now()}`,
    createdAt: new Date().toISOString(),
    commentCount: 0,
    likeCount: 0,
    saved: false,
    commitsThisMonth: 0,
    ...newAsk,
  };
  _asks = [ask, ..._asks]; // newest first
  return { ...ask };
}

/**
 * Returns a user by username, or null.
 */
export async function getUserByUsername(username) {
  await randomDelay();
  return _users.find((u) => u.username === username) ?? null;
}

/**
 * Returns the currently logged-in user, or null if logged out.
 */
export async function getCurrentUser() {
  await randomDelay();
  if (!_currentUserId) return null;
  return _users.find((u) => u.id === _currentUserId) ?? null;
}

/**
 * Returns platform-level stats.
 */
export async function getStats() {
  await randomDelay();
  return { ...mockStats };
}
