// Gabe OS AI router: the model picks tools, the Worker runs them against D1.
// Roteo is OpenAI-compatible: POST https://api.roteo.ai/v1/chat/completions

export const DEFAULT_MODEL = 'gpt-6.1-sol';
export const MODELS = [
  // GPT
  { id: 'gpt-6.1-sol', group: 'GPT', label: 'GPT-6.1 Sol', note: 'fast default' },
  { id: 'gpt-6-luna', group: 'GPT', label: 'GPT-6 Luna', note: 'cheapest GPT' },
  { id: 'gpt-6-astra', group: 'GPT', label: 'GPT-6 Astra', note: 'flagship' },
  { id: 'gpt-5.6-sol', group: 'GPT', label: 'GPT-5.6 Sol', note: 'previous Sol' },
  { id: 'gpt-5.6-terra', group: 'GPT', label: 'GPT-5.6 Terra', note: 'balanced' },
  // Claude
  { id: 'claude-haiku-5-5', group: 'Claude', label: 'Claude Haiku 5.5', note: 'fast, economical' },
  { id: 'claude-sonnet-5-5', group: 'Claude', label: 'Claude Sonnet 5.5', note: 'strong default' },
  { id: 'claude-opus-5-5', group: 'Claude', label: 'Claude Opus 5.5', note: 'hardest reasoning' },
  { id: 'claude-fable-5-1', group: 'Claude', label: 'Claude Fable 5.1', note: 'premium flagship' },
  { id: 'claude-fable-5', group: 'Claude', label: 'Claude Fable 5', note: 'previous Fable' },
  { id: 'claude-opus-5', group: 'Claude', label: 'Claude Opus 5', note: 'previous Opus' },
  { id: 'claude-sonnet-5', group: 'Claude', label: 'Claude Sonnet 5', note: 'previous Sonnet' },
  { id: 'claude-opus-4-8', group: 'Claude', label: 'Claude Opus 4.8', note: 'older' },
  { id: 'claude-opus-4-7', group: 'Claude', label: 'Claude Opus 4.7', note: 'older' },
  { id: 'claude-opus-4-6', group: 'Claude', label: 'Claude Opus 4.6', note: 'older' },
  { id: 'claude-sonnet-4-6', group: 'Claude', label: 'Claude Sonnet 4.6', note: 'older' },
  { id: 'claude-haiku-4-5', group: 'Claude', label: 'Claude Haiku 4.5', note: 'older' },
  // Open-weight
  { id: 'deepseek-v4.1-flash-1017', group: 'Open-weight', label: 'DeepSeek V4.1 Flash', note: 'very cheap' },
  { id: 'deepseek-v4-flash-0731', group: 'Open-weight', label: 'DeepSeek V4 Flash', note: 'cheapest' },
  { id: 'qwen3.8-max', group: 'Open-weight', label: 'Qwen 3.8 Max', note: 'Alibaba flagship' },
  { id: 'kimi-k3', group: 'Open-weight', label: 'Kimi K3', note: 'Moonshot' },
  { id: 'glm-5.3', group: 'Open-weight', label: 'GLM 5.3', note: 'agent-oriented' },
  { id: 'glm-5.3-flash', group: 'Open-weight', label: 'GLM 5.3 Flash', note: 'low cost' },
];
export const validModel = (m) => typeof m === 'string' && /^[a-z0-9][\w.-]{1,63}$/i.test(m);
const MAX_STEPS = 6;
const TAGS = ['Faith', 'School', 'People', 'Elevate', 'Personal', 'Fitness'];
const MODULE_IDS = ['today', 'calendar', 'faith', 'school', 'elevate', 'money', 'fitness', 'people', 'notes', 'files', 'ai', 'settings'];

const fn = (name, description, properties, required = []) => ({
  type: 'function',
  function: { name, description, parameters: { type: 'object', properties, required, additionalProperties: false } },
});
const tag = { type: 'string', enum: TAGS, description: 'Area of life this belongs to' };
const day = { type: 'string', description: 'Date as YYYY-MM-DD' };
const time = { type: 'string', description: 'Start time as 24-hour HH:MM' };

const TOOLS = [
  fn('list_schedule', 'List calendar events for a date (daily routine events are included).', { date: day }, ['date']),
  fn('create_event', 'Add a calendar event. Use repeat_daily for routine items that happen every day.', {
    title: { type: 'string' }, date: day, time, tag, repeat_daily: { type: 'boolean' },
  }, ['title', 'time']),
  fn('update_event', 'Change an existing event: move its time or date, rename it, or retag it. Get the id from list_schedule or search.', {
    id: { type: 'string' }, title: { type: 'string' }, date: day, time, tag,
  }, ['id']),
  fn('delete_event', 'Delete an event by id.', { id: { type: 'string' } }, ['id']),
  fn('list_tasks', 'List tasks. Filter by tag, or include completed ones.', { tag, include_done: { type: 'boolean' } }),
  fn('create_task', 'Add a task or reminder. Put reminder timing like "Tonight" or "Fri 3:00 PM" in note.', {
    title: { type: 'string' }, tag, due: day, note: { type: 'string' },
  }, ['title']),
  fn('update_task', 'Edit a task: mark done or not done, rename, retag, change due date or note.', {
    id: { type: 'string' }, done: { type: 'boolean' }, title: { type: 'string' }, tag, due: day, note: { type: 'string' },
  }, ['id']),
  fn('delete_task', 'Delete a task by id.', { id: { type: 'string' } }, ['id']),
  fn('create_note', 'Save a note.', { text: { type: 'string' } }, ['text']),
  fn('search', 'Search tasks, events and notes for a word or phrase, or everything with a tag.', { query: { type: 'string' } }, ['query']),
  fn('open_module', 'Open a Gabe OS module on screen when the user asks to see or open something.', {
    module: { type: 'string', enum: MODULE_IDS },
  }, ['module']),
];

const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 16);
const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const cleanTag = (t) => (TAGS.includes(t) ? t : 'Personal');
function toMin(t) {
  const m = typeof t === 'string' && t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const v = +m[1] * 60 + +m[2];
  return v >= 0 && v < 1440 ? v : null;
}
const fmt = (min) => { let h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };
const ev = (r) => ({ id: r.id, title: r.title, time: fmt(r.start_min), date: r.day === 'daily' ? 'every day' : r.day, tag: r.tag });
const tk = (r) => ({ id: r.id, title: r.title, tag: r.tag, due: r.due, done: !!r.done, note: r.note });

async function runTool(env, name, a, ctx) {
  const DB = env.DB;
  switch (name) {
    case 'list_schedule': {
      const d = isDay(a.date) ? a.date : ctx.today;
      const { results } = await DB.prepare(`SELECT * FROM events WHERE day='daily' OR day=? ORDER BY start_min`).bind(d).all();
      return { date: d, events: results.map(ev) };
    }
    case 'create_event': {
      const min = toMin(a.time);
      if (!a.title || min === null) return { error: 'Need a title and a time as HH:MM.' };
      const d = a.repeat_daily ? 'daily' : isDay(a.date) ? a.date : ctx.today;
      const r = { id: uid(), title: String(a.title).slice(0, 200), start_min: min, day: d, tag: cleanTag(a.tag) };
      await DB.prepare(`INSERT INTO events (id,title,start_min,day,tag,created_at) VALUES (?,?,?,?,?,?)`).bind(r.id, r.title, r.start_min, r.day, r.tag, Date.now()).run();
      ctx.changed = true;
      return { created: ev(r) };
    }
    case 'update_event': {
      const cur = await DB.prepare(`SELECT * FROM events WHERE id=?`).bind(a.id).first();
      if (!cur) return { error: 'No event with that id. Use list_schedule or search first.' };
      const min = a.time !== undefined ? toMin(a.time) : cur.start_min;
      const next = {
        ...cur,
        title: a.title ? String(a.title).slice(0, 200) : cur.title,
        start_min: min === null ? cur.start_min : min,
        day: isDay(a.date) ? a.date : cur.day,
        tag: a.tag ? cleanTag(a.tag) : cur.tag,
      };
      await DB.prepare(`UPDATE events SET title=?,start_min=?,day=?,tag=? WHERE id=?`).bind(next.title, next.start_min, next.day, next.tag, a.id).run();
      ctx.changed = true;
      return { before: ev(cur), after: ev(next) };
    }
    case 'delete_event': {
      const cur = await DB.prepare(`SELECT * FROM events WHERE id=?`).bind(a.id).first();
      if (!cur) return { error: 'No event with that id.' };
      await DB.prepare(`DELETE FROM events WHERE id=?`).bind(a.id).run();
      ctx.changed = true;
      return { deleted: ev(cur) };
    }
    case 'list_tasks': {
      let sql = `SELECT * FROM tasks WHERE 1=1`; const b = [];
      if (!a.include_done) sql += ` AND done=0`;
      if (a.tag) { sql += ` AND tag=?`; b.push(cleanTag(a.tag)); }
      const { results } = await DB.prepare(sql + ` ORDER BY due IS NULL, due, created_at LIMIT 100`).bind(...b).all();
      return { tasks: results.map(tk) };
    }
    case 'create_task': {
      if (!a.title) return { error: 'Need a title.' };
      const r = { id: uid(), title: String(a.title).slice(0, 300), tag: cleanTag(a.tag), due: isDay(a.due) ? a.due : null, note: a.note ? String(a.note).slice(0, 300) : null };
      await DB.prepare(`INSERT INTO tasks (id,title,tag,due,done,note,created_at) VALUES (?,?,?,?,0,?,?)`).bind(r.id, r.title, r.tag, r.due, r.note, Date.now()).run();
      ctx.changed = true;
      return { created: { ...r, done: false } };
    }
    case 'update_task': {
      const cur = await DB.prepare(`SELECT * FROM tasks WHERE id=?`).bind(a.id).first();
      if (!cur) return { error: 'No task with that id. Use list_tasks or search first.' };
      const done = a.done === undefined ? cur.done : a.done ? 1 : 0;
      const next = {
        ...cur,
        title: a.title ? String(a.title).slice(0, 300) : cur.title,
        tag: a.tag ? cleanTag(a.tag) : cur.tag,
        due: a.due !== undefined ? (isDay(a.due) ? a.due : null) : cur.due,
        note: a.note !== undefined ? (a.note ? String(a.note).slice(0, 300) : null) : cur.note,
        done, done_at: done ? cur.done_at || Date.now() : null,
      };
      await DB.prepare(`UPDATE tasks SET title=?,tag=?,due=?,note=?,done=?,done_at=? WHERE id=?`).bind(next.title, next.tag, next.due, next.note, next.done, next.done_at, a.id).run();
      ctx.changed = true;
      return { updated: tk(next) };
    }
    case 'delete_task': {
      const cur = await DB.prepare(`SELECT * FROM tasks WHERE id=?`).bind(a.id).first();
      if (!cur) return { error: 'No task with that id.' };
      await DB.prepare(`DELETE FROM tasks WHERE id=?`).bind(a.id).run();
      ctx.changed = true;
      return { deleted: tk(cur) };
    }
    case 'create_note': {
      const text = String(a.text || '').trim().slice(0, 4000);
      if (!text) return { error: 'Empty note.' };
      const id = uid();
      await DB.prepare(`INSERT INTO notes (id,text,created_at) VALUES (?,?,?)`).bind(id, text, Date.now()).run();
      ctx.changed = true;
      return { created: { id, text } };
    }
    case 'search': {
      const q = String(a.query || '').trim();
      if (!q) return { error: 'Empty query.' };
      const like = `%${q.replace(/[%_]/g, '')}%`;
      const t = TAGS.find((x) => x.toLowerCase() === q.toLowerCase().replace(/\s+systems?$/, ''));
      const [e, k, n] = await DB.batch([
        DB.prepare(`SELECT * FROM events WHERE title LIKE ? OR tag=? LIMIT 50`).bind(like, t || ''),
        DB.prepare(`SELECT * FROM tasks WHERE title LIKE ? OR note LIKE ? OR tag=? ORDER BY done LIMIT 50`).bind(like, like, t || ''),
        DB.prepare(`SELECT * FROM notes WHERE text LIKE ? ORDER BY created_at DESC LIMIT 50`).bind(like),
      ]);
      return { events: e.results.map(ev), tasks: k.results.map(tk), notes: n.results.map((r) => ({ id: r.id, text: r.text })) };
    }
    case 'open_module': {
      if (!MODULE_IDS.includes(a.module)) return { error: 'Unknown module.' };
      ctx.navigate = a.module;
      return { opened: a.module };
    }
  }
  return { error: 'Unknown tool.' };
}

function systemPrompt(ctx, snapshot) {
  return `You are the assistant inside Gabe OS, Gabe's personal life operating system. You operate it through tools: calendar, tasks, notes, search and navigation.

Now: ${ctx.nowText} (${ctx.tz}). Today is ${ctx.today}. Dates for the next 7 days: ${ctx.week}.

Rules:
- When asked to do something, do it with tools, then confirm briefly what changed (titles, dates, times in 12-hour format).
- Resolve relative dates ("tomorrow", "Friday") yourself using the dates above. "Tonight" means today.
- Before changing or deleting an event or task, find its id with list_schedule, list_tasks or search. Never invent ids.
- "Workout" and "gym" are the same thing. Routine items that repeat every day are "every day" events.
- "Remind me to X" means create_task (put timing in note, e.g. "Tonight" or "Tomorrow 8:00 AM"). "Remember that X" means create_note; if it involves following up with a person, also create a People task.
- Pick the tag that fits: Faith (Bible, church, devotion), School (classes, homework, studying), Elevate (Elevate Systems, his business), Fitness, People, Personal.
- Only delete something when Gabe clearly asks. If a request is ambiguous and destructive, ask first.
- Keep replies short and plain: 1-3 sentences, or a short "- " list for schedules and task lists. No headings. Use **bold** sparingly.

Current snapshot:
${snapshot}`;
}

async function snapshot(env, today) {
  const [e, t] = await env.DB.batch([
    env.DB.prepare(`SELECT * FROM events WHERE day='daily' OR day=? ORDER BY start_min`).bind(today),
    env.DB.prepare(`SELECT * FROM tasks WHERE done=0 ORDER BY due IS NULL, due LIMIT 40`),
  ]);
  const evs = e.results.map((r) => `- ${fmt(r.start_min)} ${r.title} [${r.tag}] id=${r.id}${r.day === 'daily' ? ' (daily)' : ''}`).join('\n') || '- none';
  const tks = t.results.map((r) => `- ${r.title} [${r.tag}]${r.due ? ' due ' + r.due : ''}${r.note ? ' (' + r.note + ')' : ''} id=${r.id}`).join('\n') || '- none';
  return `Today's schedule:\n${evs}\nOpen tasks:\n${tks}`;
}

const friendly = (status, body) => {
  if (status === 401 || status === 403) return 'Roteo rejected the API key. Check ROTEO_API_KEY in Cloudflare.';
  if (status === 402) return 'Your Roteo wallet is out of funds. Top it up at app.roteo.ai.';
  if (status === 429) return 'Roteo is rate-limiting requests. Try again in a moment.';
  if (status === 404 || status === 400) return `Roteo refused the request: ${String(body).slice(0, 160)}`;
  return `Roteo had a problem (${status}). Try again in a moment.`;
};

export async function assist(req, env, getSettings) {
  if (!env.ROTEO_API_KEY) return { status: 503, body: { error: 'AI is not connected yet. Add ROTEO_API_KEY in Cloudflare.' } };
  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : '';
  if (!text) return { status: 400, body: { error: 'Say something first.' } };
  const today = isDay(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const week = Array.isArray(body.week) ? body.week.slice(0, 7).map(String).join(', ') : '';
  const ctx = { today, week, tz: String(body.tz || 'UTC').slice(0, 64), nowText: String(body.nowText || '').slice(0, 80), changed: false, navigate: null };
  const settings = await getSettings();
  const model = validModel(body.model) ? body.model : validModel(settings.model) ? settings.model : env.ROTEO_MODEL || DEFAULT_MODEL;

  const history = Array.isArray(body.history) ? body.history.slice(-6).flatMap((h) => [
    { role: 'user', content: String(h.q || '').slice(0, 1000) },
    { role: 'assistant', content: String(h.a || '').replace(/<[^>]+>/g, ' ').slice(0, 1500) },
  ]) : [];
  const messages = [{ role: 'system', content: systemPrompt(ctx, await snapshot(env, today)) }, ...history, { role: 'user', content: text }];
  const calls = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const r = await fetch('https://api.roteo.ai/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.ROTEO_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages, tools: TOOLS, tool_choice: 'auto', temperature: 0.2 }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.error('roteo', r.status, t.slice(0, 500));
      return { status: 502, body: { error: friendly(r.status, t), calls, changed: ctx.changed } };
    }
    const data = await r.json();
    const msg = data.choices && data.choices[0] && data.choices[0].message;
    if (!msg) return { status: 502, body: { error: 'Roteo sent back an empty answer.', calls, changed: ctx.changed } };
    const toolCalls = msg.tool_calls || [];
    if (!toolCalls.length) {
      const answer = (msg.content || '').trim() || 'Done.';
      return { status: 200, body: { answer, calls, changed: ctx.changed, navigate: ctx.navigate, model } };
    }
    messages.push({ role: 'assistant', content: msg.content || null, tool_calls: toolCalls });
    for (const c of toolCalls) {
      let args = {};
      try { args = JSON.parse(c.function.arguments || '{}'); } catch (e) { /* leave empty */ }
      let result;
      try { result = await runTool(env, c.function.name, args, ctx); } catch (e) { console.error(e); result = { error: 'Tool failed on the server.' }; }
      calls.push({ name: c.function.name, args });
      messages.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(result) });
    }
  }
  return { status: 200, body: { answer: 'I made the changes above but ran out of steps to finish. Check the result and ask again if something is missing.', calls, changed: ctx.changed, navigate: ctx.navigate, model } };
}
