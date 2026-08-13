/**
 * /src/data/db.js
 *
 * Supabase-backed data layer.
 * Implements the SAME function signatures as the old mockDb.js so all
 * existing UI components work without any call-site changes.
 *
 * Shape notes (mapping DB columns → camelCase for the UI):
 *   profiles.commits_this_week  → commitsThisWeek
 *   profiles.github_verified    → githubVerified
 *   asks.author_id              → authorId
 *   asks.created_at             → createdAt
 *   asks.commits_this_month     → commitsThisMonth
 *   computed: commentCount, likeCount
 */

import { supabase, isDemoMode } from "../lib/supabaseClient.js";
import { mockAsks, mockUsers, mockStats } from "./mockData.js";

// ─────────────────────────────────────────────────────────────
//  Demo-mode in-memory mutable stores
//  (mutated by createAsk etc. so the session stays consistent)
// ─────────────────────────────────────────────────────────────
let _demoAsks  = mockAsks.map((a) => ({
  ...a,
  author: mockUsers.find((u) => u.id === a.authorId) ?? null,
}));
let _demoUsers = mockUsers.map((u) => ({ ...u }));


// ─────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────

/** Map a raw `profiles` DB row → UI user shape */
function mapProfile(row) {
  if (!row) return null;
  return {
    id:                   row.id,
    username:             row.username,
    name:                 row.name,
    college:              row.college,
    year:                 row.year,
    major:                row.major,
    githubVerified:       row.github_verified,
    githubUsername:       row.github_username,
    reputation:           row.reputation ?? 0,
    commitsThisWeek:      row.commits_this_week ?? 0,
    commitsChangePercent: row.commits_change_percent ?? 0,
    topLanguage:          row.top_language,
    topLanguagePercent:   row.top_language_percent,
    avatarUrl:            row.avatar_url,
    joinedDate:           row.created_at,
  };
}

/** Map a raw `asks` DB row (potentially with nested author profile) → UI ask shape */
function mapAsk(row) {
  if (!row) return null;
  return {
    id:               row.id,
    type:             row.type,
    title:            row.title,
    details:          row.details,
    tags:             row.tags ?? [],
    authorId:         row.author_id,
    createdAt:        row.created_at,
    commitsThisMonth: row.commits_this_month ?? 0,
    commentCount:     row.commentCount  ?? row.comment_count  ?? 0,
    likeCount:        row.likeCount     ?? row.like_count     ?? 0,
    saved:            row.saved         ?? false,
    // Flattened author fields when joined
    author:           row.profiles ? mapProfile(row.profiles) : null,
  };
}

/** Map a raw `comments` DB row (with nested author) → UI comment shape */
function mapComment(row) {
  if (!row) return null;
  return {
    id:        row.id,
    askId:     row.ask_id,
    authorId:  row.author_id,
    body:      row.body,
    createdAt: row.created_at,
    author:    row.profiles ? mapProfile(row.profiles) : null,
  };
}

/** Map a raw `groups` DB row → UI group shape */
function mapGroup(row) {
  if (!row) return null;
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    tags:        row.tags ?? [],
    memberCount: row.memberCount ?? row.member_count ?? 0,
    createdAt:   row.created_at,
  };
}

/** Map a raw `conversations` row → UI thread shape */
function mapConversation(row) {
  if (!row) return null;
  return {
    id:           row.id,
    createdAt:    row.created_at,
    participants: (row.conversation_participants ?? []).map((p) =>
      p.profiles ? mapProfile(p.profiles) : { id: p.user_id }
    ),
  };
}

/** Map a raw `messages` row → UI message shape */
function mapMessage(row) {
  if (!row) return null;
  return {
    id:             row.id,
    conversationId: row.conversation_id,
    senderId:       row.sender_id,
    body:           row.body,
    createdAt:      row.created_at,
    sender:         row.profiles ? mapProfile(row.profiles) : null,
  };
}

/** Throw a formatted error from a Supabase response */
function throwIfError({ error }) {
  if (error) throw new Error(error.message);
}

// ─────────────────────────────────────────────────────────────
//  AuthContext compat shim
//  (AuthContext previously called setCurrentUser() from mockDb;
//   with Supabase auth that's no longer needed — keep the export
//   so the old import doesn't break during the transition)
// ─────────────────────────────────────────────────────────────
/** @deprecated No-op — Supabase auth handles session state internally. */
export function setCurrentUser(_userId) {
  // intentionally empty
}

/**
 * Updates the current user's profile row.
 * Only the provided fields are updated (partial update).
 *
 * @param {object} updates  Camel-cased profile fields to update
 * @returns {Promise<Profile>}  The updated profile (camelCase shape)
 */
export async function updateProfile(updates) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Must be signed in to update profile.");

  // Map camelCase input → snake_case DB columns
  const dbUpdates = {};
  if (updates.name              !== undefined) dbUpdates.name               = updates.name;
  if (updates.college           !== undefined) dbUpdates.college            = updates.college;
  if (updates.year              !== undefined) dbUpdates.year               = updates.year;
  if (updates.major             !== undefined) dbUpdates.major              = updates.major;
  if (updates.githubUsername    !== undefined) dbUpdates.github_username    = updates.githubUsername;
  if (updates.avatarUrl         !== undefined) dbUpdates.avatar_url         = updates.avatarUrl;
  if (updates.username          !== undefined) dbUpdates.username           = updates.username;
  if (updates.topLanguage       !== undefined) dbUpdates.top_language       = updates.topLanguage;
  if (updates.commitsThisWeek   !== undefined) dbUpdates.commits_this_week  = updates.commitsThisWeek;

  const { data, error } = await supabase
    .from("profiles")
    .update(dbUpdates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapProfile(data);
}

// ─────────────────────────────────────────────────────────────
//  READS
// ─────────────────────────────────────────────────────────────

/**
 * Returns asks posted by the currently signed-in user.
 *
 * @returns {Promise<Ask[]>}
 */
export async function getMyAsks() {
  if (isDemoMode) {
    return _demoAsks.filter((a) => a.authorId === "u1");
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return [];

  const { data, error } = await supabase
    .from("asks")
    .select(`
      *,
      profiles ( id, username, name, college, avatar_url, github_verified, commits_this_week ),
      commentCount:comments(count),
      likeCount:likes(count)
    `)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const commentCount = row.commentCount?.[0]?.count ?? 0;
    const likeCount    = row.likeCount?.[0]?.count    ?? 0;
    return mapAsk({ ...row, commentCount, likeCount });
  });
}

/**
 * Returns asks saved by the currently signed-in user.
 *
 * @returns {Promise<Ask[]>}
 */
export async function getSavedAsks() {
  if (isDemoMode) {
    return _demoAsks.filter((a) => a.saved === true);
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return [];

  const { data, error } = await supabase
    .from("saves")
    .select(`
      ask_id,
      asks (
        *,
        profiles ( id, username, name, college, avatar_url, github_verified, commits_this_week ),
        commentCount:comments(count),
        likeCount:likes(count)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => row.asks)
    .filter(Boolean)
    .map((row) => {
      const commentCount = row.commentCount?.[0]?.count ?? 0;
      const likeCount    = row.likeCount?.[0]?.count    ?? 0;
      return mapAsk({ ...row, commentCount, likeCount, saved: true });
    });
}

/**
 * Returns all asks, optionally filtered by type.
 * Includes authorName, college, avatar_url from profiles,
 * plus aggregated commentCount and likeCount.
 *
 * @param {"help"|"teammate"|"build_log"|undefined} filterByType
 * @returns {Promise<Ask[]>}
 */
export async function getAsks(filterByType) {
  if (isDemoMode) {
    const result = filterByType
      ? _demoAsks.filter((a) => a.type === filterByType)
      : [..._demoAsks];
    return result;
  }

  let query = supabase
    .from("asks")
    .select(`
      *,
      profiles ( id, username, name, college, avatar_url, github_verified, commits_this_week ),
      commentCount:comments(count),
      likeCount:likes(count)
    `)
    .order("created_at", { ascending: false });

  if (filterByType) {
    query = query.eq("type", filterByType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const commentCount = row.commentCount?.[0]?.count ?? 0;
    const likeCount    = row.likeCount?.[0]?.count    ?? 0;
    return mapAsk({ ...row, commentCount, likeCount });
  });
}

/**
 * Returns a single ask by id, with the author profile and all comments
 * (each with their author profile), ordered oldest first.
 *
 * @param {string} id
 * @returns {Promise<Ask|null>}
 */
export async function getAskById(id) {
  if (isDemoMode) {
    const ask = _demoAsks.find((a) => a.id === id);
    return ask ? { ...ask, comments: [] } : null;
  }

  const { data, error } = await supabase
    .from("asks")
    .select(`
      *,
      profiles ( id, username, name, college, avatar_url, github_verified, commits_this_week ),
      comments (
        *,
        profiles ( id, username, name, college, avatar_url )
      )
    `)
    .eq("id", id)
    .order("created_at", { referencedTable: "comments", ascending: true })
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const ask = mapAsk(data);
  ask.comments = (data.comments ?? []).map(mapComment);
  return ask;
}

/**
 * Creates a new ask for the current authenticated user.
 * The caller provides: { type, title, details, tags?, commitsThisMonth? }
 * author_id is read from the active session — never trusted from the caller.
 *
 * @param {object} newAsk
 * @returns {Promise<Ask>}
 */
export async function createAsk(newAsk) {
  if (isDemoMode) {
    const ask = {
      id:               `demo-${Date.now()}`,
      type:             newAsk.type,
      title:            newAsk.title,
      details:          newAsk.details,
      tags:             newAsk.tags ?? [],
      authorId:         "u1",
      createdAt:        new Date().toISOString(),
      commitsThisMonth: newAsk.commitsThisMonth ?? 0,
      commentCount:     0,
      likeCount:        0,
      saved:            false,
      author:           _demoUsers.find((u) => u.id === "u1") ?? null,
    };
    _demoAsks = [ask, ..._demoAsks];
    return { ...ask };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("You must be signed in to post an ask.");

  const payload = {
    author_id:          user.id,
    type:               newAsk.type,
    title:              newAsk.title,
    details:            newAsk.details,
    tags:               newAsk.tags ?? [],
    commits_this_month: newAsk.commitsThisMonth ?? newAsk.commits_this_month ?? 0,
  };

  const { data, error } = await supabase
    .from("asks")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapAsk(data);
}

/**
 * Returns a user profile by username, plus their asks for the activity feed.
 *
 * @param {string} username
 * @returns {Promise<{user: Profile, asks: Ask[]} | null>}
 */
export async function getUserByUsername(username) {
  if (isDemoMode) {
    const user = _demoUsers.find((u) => u.username === username);
    if (!user) return null;
    const userAsks = _demoAsks.filter((a) => a.authorId === user.id);
    return { ...user, asks: userAsks };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) return null;

  const { data: asks, error: asksError } = await supabase
    .from("asks")
    .select(`
      *,
      commentCount:comments(count),
      likeCount:likes(count)
    `)
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  if (asksError) throw new Error(asksError.message);

  const mappedProfile = mapProfile(profile);
  mappedProfile.asks = (asks ?? []).map((row) => {
    const commentCount = row.commentCount?.[0]?.count ?? 0;
    const likeCount    = row.likeCount?.[0]?.count    ?? 0;
    return mapAsk({ ...row, commentCount, likeCount });
  });

  return mappedProfile;
}

/**
 * Returns the current Supabase auth user merged with their profiles row,
 * or null if logged out.
 *
 * @returns {Promise<Profile|null>}
 */
export async function getCurrentUser() {
  if (isDemoMode) {
    return _demoUsers[0]; // Demo: always return first mock user
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return mapProfile(profile);
}

/**
 * Returns platform-level aggregate stats.
 *
 * @returns {Promise<{ activeBuilders, questionsAnswered, teamsFormed, collegesCount }>}
 */
export async function getStats() {
  if (isDemoMode) return { ...mockStats };

  const [
    { count: activeBuilders },
    { count: questionsAnswered },
    { count: teamsFormed },
    { data: collegeRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("group_members").select("group_id", { count: "exact", head: true }),
    supabase.from("profiles").select("college").not("college", "is", null),
  ]);

  const distinctColleges = new Set(
    (collegeRows ?? []).map((r) => r.college).filter(Boolean)
  );

  return {
    activeBuilders:    activeBuilders  ?? 0,
    questionsAnswered: questionsAnswered ?? 0,
    teamsFormed:       teamsFormed     ?? 0,
    collegesCount:     distinctColleges.size,
  };
}

// ─────────────────────────────────────────────────────────────
//  LIKES & SAVES
// ─────────────────────────────────────────────────────────────

/**
 * Toggles a like on an ask for the current user.
 * Returns { liked: boolean } — true if the like now exists.
 *
 * @param {string} askId
 * @returns {Promise<{ liked: boolean }>}
 */
export async function toggleLike(askId) {
  if (isDemoMode) {
    const ask = _demoAsks.find((a) => a.id === askId);
    if (ask) ask.likeCount = (ask.likeCount ?? 0) + (ask._liked ? -1 : 1);
    if (ask) ask._liked = !ask._liked;
    return { liked: ask?._liked ?? false };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to like.");

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("ask_id", askId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    throwIfError(await supabase.from("likes").delete().eq("id", existing.id));
    return { liked: false };
  } else {
    throwIfError(await supabase.from("likes").insert({ ask_id: askId, user_id: user.id }));
    return { liked: true };
  }
}

/**
 * Toggles a save on an ask for the current user.
 * Returns { saved: boolean }.
 *
 * @param {string} askId
 * @returns {Promise<{ saved: boolean }>}
 */
export async function toggleSave(askId) {
  if (isDemoMode) {
    const ask = _demoAsks.find((a) => a.id === askId);
    if (ask) ask.saved = !ask.saved;
    return { saved: ask?.saved ?? false };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to save.");

  const { data: existing } = await supabase
    .from("saves")
    .select("id")
    .eq("ask_id", askId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    throwIfError(await supabase.from("saves").delete().eq("id", existing.id));
    return { saved: false };
  } else {
    throwIfError(await supabase.from("saves").insert({ ask_id: askId, user_id: user.id }));
    return { saved: true };
  }
}

// ─────────────────────────────────────────────────────────────
//  COMMENTS
// ─────────────────────────────────────────────────────────────

/**
 * Adds a comment to an ask.
 *
 * @param {string} askId
 * @param {string} body
 * @returns {Promise<Comment>}
 */
export async function addComment(askId, body) {
  if (isDemoMode) {
    const comment = {
      id:        `demo-c-${Date.now()}`,
      askId,
      authorId:  "u1",
      body,
      createdAt: new Date().toISOString(),
      author:    _demoUsers[0],
    };
    return comment;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to comment.");

  const { data, error } = await supabase
    .from("comments")
    .insert({ ask_id: askId, author_id: user.id, body })
    .select(`*, profiles ( id, username, name, college, avatar_url )`)
    .single();

  if (error) throw new Error(error.message);
  return mapComment(data);
}

// ─────────────────────────────────────────────────────────────
//  GROUPS
// ─────────────────────────────────────────────────────────────

/**
 * Returns all groups with a computed memberCount.
 *
 * @returns {Promise<Group[]>}
 */
export async function getGroups() {
  if (isDemoMode) {
    // Return some mock groups for the prototype
    return [
      { id: "g1", name: "SIH 2025 Prep", description: "For teams preparing for Smart India Hackathon 2025.", tags: ["hackathon","SIH"], memberCount: 42, createdAt: "2025-07-01T00:00:00Z" },
      { id: "g2", name: "ML Study Group", description: "Weekly sessions on ML papers and implementations.", tags: ["machine-learning","python"], memberCount: 28, createdAt: "2025-06-15T00:00:00Z" },
      { id: "g3", name: "Web Dev Crew", description: "Frontend and backend web devs at Indian colleges.", tags: ["react","node.js","fullstack"], memberCount: 65, createdAt: "2025-05-20T00:00:00Z" },
      { id: "g4", name: "Open Source Contributors", description: "Find GSoC/Outreachy buddies and collaborate on OSS.", tags: ["open-source","GSoC"], memberCount: 34, createdAt: "2025-07-10T00:00:00Z" },
    ];
  }

  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      memberCount:group_members(count)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const memberCount = row.memberCount?.[0]?.count ?? 0;
    return mapGroup({ ...row, memberCount });
  });
}

/**
 * Joins a group as the current user.
 *
 * @param {string} groupId
 */
export async function joinGroup(groupId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to join a group.");

  throwIfError(
    await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: user.id })
  );
}

/**
 * Leaves a group as the current user.
 *
 * @param {string} groupId
 */
export async function leaveGroup(groupId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to leave a group.");

  throwIfError(
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id)
  );
}

// ─────────────────────────────────────────────────────────────
//  MESSAGES
// ─────────────────────────────────────────────────────────────

/**
 * Returns all conversations the current user participates in,
 * with participant profiles.
 *
 * @returns {Promise<Conversation[]>}
 */
export async function getConversations() {
  if (isDemoMode) return []; // No mock conversations in demo

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_participants (
        user_id,
        profiles ( id, username, name, avatar_url )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapConversation);
}

/**
 * Returns all messages in a conversation, oldest first.
 *
 * @param {string} conversationId
 * @returns {Promise<Message[]>}
 */
export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select(`*, profiles ( id, username, name, avatar_url )`)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMessage);
}

/**
 * Sends a message in a conversation.
 *
 * @param {string} conversationId
 * @param {string} body
 * @returns {Promise<Message>}
 */
export async function sendMessage(conversationId, body) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to send messages.");

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body })
    .select(`*, profiles ( id, username, name, avatar_url )`)
    .single();

  if (error) throw new Error(error.message);
  return mapMessage(data);
}

/**
 * Starts a new 1:1 conversation with another user.
 * Creates the conversation row and inserts both participants.
 *
 * @param {string} otherUserId
 * @returns {Promise<Conversation>}
 */
export async function startConversation(otherUserId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in to start a conversation.");

  // Create conversation
  const { data: conv, error: convError } = await supabase
    .from("conversations")
    .insert({})
    .select()
    .single();

  if (convError) throw new Error(convError.message);

  // Add both participants
  const participants = [
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: otherUserId },
  ];

  throwIfError(
    await supabase.from("conversation_participants").insert(participants)
  );

  return mapConversation(conv);
}
