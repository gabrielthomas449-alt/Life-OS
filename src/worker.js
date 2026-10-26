// Gabe OS API — Cloudflare Worker + D1
// Static files in /public are served by Workers Assets; this handles /api/*.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, label TEXT)`,
  `CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, start_min INTEGER NOT NULL, day TEXT NOT NULL, tag TEXT NOT NULL DEFAULT 'Personal', created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, tag TEXT NOT NULL DEFAULT 'Personal', due TEXT, done INTEGER NOT NULL DEFAULT 0, note TEXT, created_at INTEGER NOT NULL, done_at INTEGER)`,
  `CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, text TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS habits (id TEXT PRIMARY KEY, name TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 0, kind TEXT, sub TEXT, sort INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, q TEXT NOT NULL, a TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due)`,
  `CREATE INDEX IF NOT EXISTS idx_events_day ON events(day)`,
];

const SESSION_DAYS = 365;
const COOKIE = 'gos_session';
let ready = null;

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const err = (status, message) => json({ error: message }, status);
const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 16);
const now = () => Date.now();
const TAGS = ['Faith', 'School', 'People', 'Elevate', 'Personal', 'Fitness'];
const cleanTag = (t) => (TAGS.includes(t) ? t : 'Personal');
const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const str = (s, max = 500) => (typeof s === 'string' ? s.trim().slice(0, max) : '');

async function init(env) {
  if (!ready) {
    ready = (async () => {
      await env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)));
      const seeded = await env.DB.prepare(`SELECT value FROM meta WHERE key='seeded'`).first();
      if (!seeded) await seed(env);
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

async function seed(env) {
  const t = now();
  const S = [];
  const ev = (title, min, day, tag) => S.push(env.DB.prepare(`INSERT INTO events (id,title,start_min,day,tag,created_at) VALUES (?,?,?,?,?,?)`).bind(uid(), title, min, day, tag, t));
  ev('Gym', 300, 'daily', 'Fitness');
  ev('Breakfast', 450, 'daily', 'Personal');
  ev('Class', 540, 'daily', 'School');
  ev('Lunch', 720, 'daily', 'Personal');
  ev('Bike trip', 930, 'daily', 'Fitness');
  ev('Mentor group', 1140, 'daily', 'Faith');
  const tk = (title, tag, note) => S.push(env.DB.prepare(`INSERT INTO tasks (id,title,tag,due,done,note,created_at) VALUES (?,?,?,NULL,0,?,?)`).bind(uid(), title, tag, note || null, t));
  tk('Memorize Constitution Preamble', 'School', 'Review tonight');
  tk('Read Genesis 4', 'Faith');
  tk('1 Peter devotion', 'Faith');
  tk('Follow up with Hannah', 'People');
  const hb = (name, value, kind, sub, sort) => S.push(env.DB.prepare(`INSERT INTO habits (id,name,value,kind,sub,sort) VALUES (?,?,?,?,?,?)`).bind(uid(), name, value, kind, sub, sort));
  hb('Bible time', 55, null, null, 0);
  hb('Workout', 100, 'ok', null, 1);
  hb('Phone time', 30, 'warn', 'of daily limit', 2);
  S.push(env.DB.prepare(`INSERT OR REPLACE INTO meta (key,value) VALUES ('settings', ?)`).bind(JSON.stringify({ clock: true, notify: true })));
  S.push(env.DB.prepare(`INSERT OR REPLACE INTO meta (key,value) VALUES ('seeded', '1')`));
  await env.DB.batch(S);
}

// ---------- Auth ----------
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function hashPass(pass, saltHex) {
  const salt = saltHex ? Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return { salt: hex(salt), hash: hex(bits) };
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function cookieToken(req) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})'));
  return m ? m[1] : null;
}
async function authed(req, env) {
  const bearer = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (bearer && env.API_TOKEN && safeEqual(bearer[1], env.API_TOKEN)) return true;
  const tok = cookieToken(req);
  if (!tok) return false;
  const row = await env.DB.prepare(`SELECT expires_at FROM sessions WHERE token=?`).bind(tok).first();
  return !!row && row.expires_at > now();
}
async function newSession(env, label) {
  const tok = hex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare(`INSERT INTO sessions (token,created_at,expires_at,label) VALUES (?,?,?,?)`).bind(tok, now(), now() + SESSION_DAYS * 864e5, label || null).run();
  return `${COOKIE}=${tok}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
// simple brute-force brake: track failed attempts in meta
async function tooManyFails(env) {
  const r = await env.DB.prepare(`SELECT value FROM meta WHERE key='fails'`).first();
  if (!r) return false;
  const { n, at } = JSON.parse(r.value);
  return n >= 8 && now() - at < 15 * 60e3;
}
async function recordFail(env, reset) {
  if (reset) return env.DB.prepare(`DELETE FROM meta WHERE key='fails'`).run();
  const r = await env.DB.prepare(`SELECT value FROM meta WHERE key='fails'`).first();
  let v = r ? JSON.parse(r.value) : { n: 0, at: now() };
  if (now() - v.at > 15 * 60e3) v = { n: 0, at: now() };
  v.n++; v.at = now();
  await env.DB.prepare(`INSERT OR REPLACE INTO meta (key,value) VALUES ('fails',?)`).bind(JSON.stringify(v)).run();
}

async function authRoutes(req, env, path) {
  const pass = await env.DB.prepare(`SELECT value FROM meta WHERE key='passcode'`).first();
  if (path === '/api/auth/status') {
    return json({ setup: !!pass, authed: await authed(req, env) });
  }
  if (req.method !== 'POST') return err(405, 'Use POST.');
  const body = await req.json().catch(() => ({}));
  if (path === '/api/auth/setup') {
    if (pass) return err(409, 'A passcode is already set. Sign in instead.');
    const p = typeof body.passcode === 'string' ? body.passcode : '';
    if (p.length < 6) return err(400, 'Use at least 6 characters.');
    const h = await hashPass(p);
    await env.DB.prepare(`INSERT INTO meta (key,value) VALUES ('passcode',?)`).bind(JSON.stringify(h)).run();
    return json({ ok: true }, 200, { 'set-cookie': await newSession(env, body.device) });
  }
  if (path === '/api/auth/login') {
    if (!pass) return err(409, 'No passcode yet. Create one first.');
    if (await tooManyFails(env)) return err(429, 'Too many wrong attempts. Try again in 15 minutes.');
    const stored = JSON.parse(pass.value);
    const h = await hashPass(typeof body.passcode === 'string' ? body.passcode : '', stored.salt);
    if (!safeEqual(h.hash, stored.hash)) { await recordFail(env); return err(401, 'That passcode is not right.'); }
    await recordFail(env, true);
    return json({ ok: true }, 200, { 'set-cookie': await newSession(env, body.device) });
  }
  if (path === '/api/auth/logout') {
    const tok = cookieToken(req);
    if (tok) await env.DB.prepare(`DELETE FROM sessions WHERE token=?`).bind(tok).run();
    return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
  }
  return err(404, 'Unknown auth route.');
}

// ---------- Data ----------
const mapTask = (r) => ({ id: r.id, title: r.title, tag: r.tag, due: r.due, done: !!r.done, note: r.note, createdAt: r.created_at, doneAt: r.done_at });
const mapEvent = (r) => ({ id: r.id, title: r.title, min: r.start_min, day: r.day, tag: r.tag });
const mapNote = (r) => ({ id: r.id, text: r.text, at: r.created_at });

async function state(env) {
  const [ev, tk, nt, hb, st, lg] = await env.DB.batch([
    env.DB.prepare(`SELECT * FROM events ORDER BY start_min`),
    env.DB.prepare(`SELECT * FROM tasks WHERE done=0 OR done_at > ? ORDER BY created_at`).bind(now() - 30 * 864e5),
    env.DB.prepare(`SELECT * FROM notes ORDER BY created_at DESC LIMIT 200`),
    env.DB.prepare(`SELECT * FROM habits ORDER BY sort`),
    env.DB.prepare(`SELECT value FROM meta WHERE key='settings'`),
    env.DB.prepare(`SELECT q,a,created_at FROM log ORDER BY id DESC LIMIT 40`),
  ]);
  return {
    events: ev.results.map(mapEvent),
    tasks: tk.results.map(mapTask),
    notes: nt.results.map(mapNote),
    habits: hb.results.map((r) => ({ id: r.id, name: r.name, v: r.value, kind: r.kind, sub: r.sub })),
    settings: st.results[0] ? JSON.parse(st.results[0].value) : { clock: true, notify: true },
    log: lg.results.reverse().map((r) => ({ q: r.q, a: r.a, at: r.created_at })),
  };
}

async function dataRoutes(req, env, path) {
  const m = req.method;
  const seg = path.split('/').filter(Boolean); // ['api','tasks',id?]
  const [, kind, id] = seg;
  const body = m === 'GET' || m === 'DELETE' ? {} : await req.json().catch(() => ({}));

  if (kind === 'state' && m === 'GET') return json(await state(env));

  if (kind === 'tasks') {
    if (m === 'POST' && !id) {
      const title = str(body.title, 300);
      if (!title) return err(400, 'A task needs a title.');
      if (body.due != null && !isDay(body.due)) return err(400, 'Due date must look like 2026-10-23.');
      const r = { id: uid(), title, tag: cleanTag(body.tag), due: body.due || null, note: str(body.note, 300) || null, created_at: now() };
      await env.DB.prepare(`INSERT INTO tasks (id,title,tag,due,done,note,created_at) VALUES (?,?,?,?,0,?,?)`).bind(r.id, r.title, r.tag, r.due, r.note, r.created_at).run();
      return json(mapTask({ ...r, done: 0, done_at: null }), 201);
    }
    if (m === 'PATCH' && id) {
      const cur = await env.DB.prepare(`SELECT * FROM tasks WHERE id=?`).bind(id).first();
      if (!cur) return err(404, 'Task not found.');
      const done = body.done === undefined ? cur.done : body.done ? 1 : 0;
      const next = {
        title: body.title !== undefined ? str(body.title, 300) || cur.title : cur.title,
        tag: body.tag !== undefined ? cleanTag(body.tag) : cur.tag,
        due: body.due !== undefined ? (isDay(body.due) ? body.due : null) : cur.due,
        note: body.note !== undefined ? str(body.note, 300) || null : cur.note,
        done, done_at: done ? cur.done_at || now() : null,
      };
      await env.DB.prepare(`UPDATE tasks SET title=?,tag=?,due=?,note=?,done=?,done_at=? WHERE id=?`).bind(next.title, next.tag, next.due, next.note, next.done, next.done_at, id).run();
      return json(mapTask({ ...cur, ...next }));
    }
    if (m === 'DELETE' && id) { await env.DB.prepare(`DELETE FROM tasks WHERE id=?`).bind(id).run(); return json({ ok: true }); }
  }

  if (kind === 'events') {
    const okMin = (v) => Number.isInteger(v) && v >= 0 && v < 1440;
    if (m === 'POST' && !id) {
      const title = str(body.title, 200);
      if (!title) return err(400, 'An event needs a title.');
      if (!okMin(body.min)) return err(400, 'Start time must be minutes after midnight (0–1439).');
      if (body.day !== 'daily' && !isDay(body.day)) return err(400, 'Day must be "daily" or a date like 2026-10-23.');
      const r = { id: uid(), title, start_min: body.min, day: body.day, tag: cleanTag(body.tag), created_at: now() };
      await env.DB.prepare(`INSERT INTO events (id,title,start_min,day,tag,created_at) VALUES (?,?,?,?,?,?)`).bind(r.id, r.title, r.start_min, r.day, r.tag, r.created_at).run();
      return json(mapEvent(r), 201);
    }
    if (m === 'PATCH' && id) {
      const cur = await env.DB.prepare(`SELECT * FROM events WHERE id=?`).bind(id).first();
      if (!cur) return err(404, 'Event not found.');
      const next = {
        title: body.title !== undefined ? str(body.title, 200) || cur.title : cur.title,
        start_min: body.min !== undefined ? (okMin(body.min) ? body.min : cur.start_min) : cur.start_min,
        day: body.day !== undefined ? (body.day === 'daily' || isDay(body.day) ? body.day : cur.day) : cur.day,
        tag: body.tag !== undefined ? cleanTag(body.tag) : cur.tag,
      };
      await env.DB.prepare(`UPDATE events SET title=?,start_min=?,day=?,tag=? WHERE id=?`).bind(next.title, next.start_min, next.day, next.tag, id).run();
      return json(mapEvent({ ...cur, ...next }));
    }
    if (m === 'DELETE' && id) { await env.DB.prepare(`DELETE FROM events WHERE id=?`).bind(id).run(); return json({ ok: true }); }
  }

  if (kind === 'notes') {
    if (m === 'POST' && !id) {
      const text = str(body.text, 4000);
      if (!text) return err(400, 'A note needs some text.');
      const r = { id: uid(), text, created_at: now() };
      await env.DB.prepare(`INSERT INTO notes (id,text,created_at) VALUES (?,?,?)`).bind(r.id, r.text, r.created_at).run();
      return json(mapNote(r), 201);
    }
    if (m === 'DELETE' && id) { await env.DB.prepare(`DELETE FROM notes WHERE id=?`).bind(id).run(); return json({ ok: true }); }
  }

  if (kind === 'settings' && m === 'PUT') {
    const s = { clock: !!body.clock, notify: !!body.notify };
    await env.DB.prepare(`INSERT OR REPLACE INTO meta (key,value) VALUES ('settings',?)`).bind(JSON.stringify(s)).run();
    return json(s);
  }

  if (kind === 'log' && m === 'POST') {
    const q = str(body.q, 1000), a = str(body.a, 8000);
    if (!q) return err(400, 'Missing request text.');
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO log (q,a,created_at) VALUES (?,?,?)`).bind(q, a, now()),
      env.DB.prepare(`DELETE FROM log WHERE id NOT IN (SELECT id FROM log ORDER BY id DESC LIMIT 200)`),
    ]);
    return json({ ok: true }, 201);
  }

  return err(404, 'Unknown route.');
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (!path.startsWith('/api/')) return env.ASSETS.fetch(req);
    if (!env.DB) return err(500, 'Database is not connected. Add a D1 binding named DB.');
    // CSRF guard for cookie-authenticated writes
    if (req.method !== 'GET' && req.headers.get('origin') && new URL(req.headers.get('origin')).host !== url.host && !req.headers.get('authorization')) {
      return err(403, 'Cross-site request blocked.');
    }
    try {
      await init(env);
      if (path.startsWith('/api/auth/')) return await authRoutes(req, env, path);
      if (path === '/api/health') return json({ ok: true });
      if (!(await authed(req, env))) return err(401, 'Sign in to continue.');
      return await dataRoutes(req, env, path);
    } catch (e) {
      console.error(e);
      return err(500, 'Something went wrong on the server. Check the Worker logs in Cloudflare.');
    }
  },
};
