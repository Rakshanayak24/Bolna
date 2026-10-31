const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA, 'clinic.json');
const PORT = Number(process.env.PORT || 3000);

const initial = {
  clinic: { name: 'Jeevan Family Clinic', specialty: 'Family medicine', address: '12, 8th Cross, Indiranagar, Bengaluru', phone: '+91 80 4567 8900', hours: 'Mon–Sat, 9:00 AM–6:00 PM', languages: ['English', 'ಕನ್ನಡ', 'हिन्दी'], slots: ['9:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:30 PM', '4:00 PM'] },
  appointments: [
    { id: 'apt_1001', patient: 'Ananya Rao', phone: '+91 98450 11223', date: today(), time: '10:30 AM', reason: 'General consultation', language: 'English', status: 'confirmed', createdAt: new Date().toISOString() },
    { id: 'apt_1002', patient: 'Kiran Kumar', phone: '+91 99001 23456', date: today(), time: '11:30 AM', reason: 'Follow-up', language: 'ಕನ್ನಡ', status: 'confirmed', createdAt: new Date().toISOString() },
    { id: 'apt_1003', patient: 'Meera Sharma', phone: '+91 98860 54321', date: tomorrow(), time: '2:00 PM', reason: 'General consultation', language: 'हिन्दी', status: 'confirmed', createdAt: new Date().toISOString() },
    { id: 'apt_demo_open', patient: 'Cancelled demo visit', phone: '', date: tomorrow(), time: '10:00 AM', reason: 'Released slot · demo', language: 'English', status: 'cancelled', createdAt: new Date().toISOString() }
  ],
  waitlist: [
    { id: 'wl_4001', patient: 'Priya Nair', phone: '+91 98765 01010', reason: 'General consultation', language: 'English', consent: true, available: true, priority: 1 },
    { id: 'wl_4002', patient: 'Sahana Gowda', phone: '+91 98765 02020', reason: 'Follow-up', language: 'ಕನ್ನಡ', consent: true, available: true, priority: 2 },
    { id: 'wl_4003', patient: 'Arjun Verma', phone: '+91 98765 03030', reason: 'General consultation', language: 'हिन्दी', consent: true, available: true, priority: 3 }
  ],
  rescues: [],
  calls: [
    { id: 'call_2001', caller: 'Ananya Rao', intent: 'Appointment booked', detail: 'Tomorrow · 10:30 AM', language: 'English', outcome: 'Completed', at: ago(12) },
    { id: 'call_2002', caller: 'Unknown caller', intent: 'Clinic hours', detail: 'Shared opening hours', language: 'ಕನ್ನಡ', outcome: 'Completed', at: ago(38) },
    { id: 'call_2003', caller: 'R. Mehta', intent: 'Staff callback', detail: 'Requested a human callback', language: 'हिन्दी', outcome: 'Needs follow-up', at: ago(74) },
    { id: 'call_2004', caller: 'Unknown caller', intent: 'Appointment booked', detail: 'Tomorrow · 2:00 PM', language: 'English', outcome: 'Completed', at: ago(130) }
  ],
  callbacks: [{ id: 'cb_3001', caller: 'R. Mehta', phone: '+91 98860 54321', reason: 'Please call me about my appointment.', language: 'हिन्दी', status: 'Pending', at: ago(74) }]
};

function today() { return dateAt(0); }
function tomorrow() { return dateAt(1); }
function dateAt(n) { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function ago(minutes) { return new Date(Date.now() - minutes * 60000).toISOString(); }
function readDB() {
  fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  let migrated = false;
  if (!db.waitlist) { db.waitlist = initial.waitlist.map(x => ({ ...x })); migrated = true; }
  if (!db.rescues) { db.rescues = []; migrated = true; }
  // Keep dashboard examples useful on a new day without overwriting user-created records.
  if (migrated) save(db);
  return db;
}
function save(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 20000) reject(new Error('Request too large')); });
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}
function clean(value, max = 160) { return String(value ?? '').trim().slice(0, max); }
function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true, demo: true });
  if (req.method === 'GET' && url.pathname === '/api/state') return send(res, 200, readDB());
  if (req.method === 'POST' && url.pathname === '/api/appointments') return readBody(req).then(body => {
    const patient = clean(body.patient, 80), phone = clean(body.phone, 30), date = clean(body.date, 10), time = clean(body.time, 20);
    if (!patient || !phone || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return send(res, 400, { error: 'Add a patient name, phone number, date, and time.' });
    const db = readDB();
    if (db.appointments.some(a => a.date === date && a.time === time && a.status !== 'cancelled')) return send(res, 409, { error: 'That slot was just taken. Please choose another time.' });
    const appointment = { id: `apt_${crypto.randomUUID().slice(0,8)}`, patient, phone, date, time, reason: clean(body.reason, 100) || 'General consultation', language: clean(body.language, 24) || 'English', status: 'confirmed', createdAt: new Date().toISOString() };
    db.appointments.unshift(appointment);
    db.calls.unshift({ id: `call_${crypto.randomUUID().slice(0,8)}`, caller: patient, intent: 'Appointment booked', detail: `${date} · ${time}`, language: appointment.language, outcome: 'Completed', at: new Date().toISOString() });
    save(db); return send(res, 201, { appointment, state: db });
  }).catch(() => send(res, 400, { error: 'Could not read request.' }));
  if (req.method === 'POST' && url.pathname === '/api/callbacks') return readBody(req).then(body => {
    const caller = clean(body.caller, 80) || 'Unknown caller', phone = clean(body.phone, 30), reason = clean(body.reason, 300);
    if (!reason) return send(res, 400, { error: 'Add a short note for the clinic team.' });
    const db = readDB();
    const callback = { id: `cb_${crypto.randomUUID().slice(0,8)}`, caller, phone, reason, language: clean(body.language, 24) || 'English', status: 'Pending', at: new Date().toISOString() };
    db.callbacks.unshift(callback);
    db.calls.unshift({ id: `call_${crypto.randomUUID().slice(0,8)}`, caller, intent: 'Staff callback', detail: reason, language: callback.language, outcome: 'Needs follow-up', at: callback.at });
    save(db); return send(res, 201, { callback, state: db });
  }).catch(() => send(res, 400, { error: 'Could not read request.' }));
  const cancel = url.pathname.match(/^\/api\/appointments\/([^/]+)\/cancel$/);
  if (req.method === 'POST' && cancel) { const db = readDB(); const apt = db.appointments.find(x => x.id === cancel[1]); if (!apt) return send(res, 404, { error: 'Appointment not found.' }); if (apt.status === 'cancelled') return send(res, 200, { state: db }); apt.status = 'cancelled'; save(db); return send(res, 200, { state: db }); }
  if (req.method === 'POST' && url.pathname === '/api/rescues') return readBody(req).then(body => {
    const db = readDB(), date = clean(body.date, 10), time = clean(body.time, 20), candidateId = clean(body.candidateId, 40), outcome = body.outcome === 'declined' ? 'declined' : 'accepted';
    const candidate = db.waitlist.find(x => x.id === candidateId && x.available && x.consent);
    if (!candidate) return send(res, 400, { error: 'Choose a patient who has opted in and is still available.' });
    const alreadyDeclined = new Set(db.rescues.filter(r => r.date === date && r.time === time && r.status === 'Offer declined').map(r => r.candidateId));
    const nextCandidate = db.waitlist.filter(x => x.available && x.consent && !alreadyDeclined.has(x.id)).sort((a,b) => a.priority - b.priority)[0];
    if (!nextCandidate || nextCandidate.id !== candidate.id) return send(res, 409, { error: 'The next eligible waitlist patient changed. Refresh and try again.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return send(res, 400, { error: 'A valid released slot is required.' });
    if (!db.appointments.some(a => a.date === date && a.time === time && a.status === 'cancelled')) return send(res, 409, { error: 'That slot has not been released for recovery.' });
    if (db.appointments.some(a => a.date === date && a.time === time && a.status !== 'cancelled')) return send(res, 409, { error: 'That slot is no longer available.' });
    const at = new Date().toISOString(), rescue = { id: `res_${crypto.randomUUID().slice(0,8)}`, date, time, candidateId, patient: candidate.patient, language: candidate.language, status: outcome === 'accepted' ? 'Recovered' : 'Offer declined', at };
    db.rescues.unshift(rescue);
    db.calls.unshift({ id: `call_${crypto.randomUUID().slice(0,8)}`, caller: candidate.patient, intent: 'Waitlist slot offer', detail: `${date} · ${time}`, language: candidate.language, outcome: outcome === 'accepted' ? 'Slot recovered · demo' : 'Offer declined · demo', at });
    if (outcome === 'accepted') { candidate.available = false; db.appointments.unshift({ id: `apt_${crypto.randomUUID().slice(0,8)}`, patient: candidate.patient, phone: candidate.phone, date, time, reason: candidate.reason, language: candidate.language, status: 'confirmed', createdAt: at }); }
    save(db); return send(res, 201, { rescue, state: db });
  }).catch(() => send(res, 400, { error: 'Could not read request.' }));
  const complete = url.pathname.match(/^\/api\/callbacks\/([^/]+)\/complete$/);
  if (req.method === 'POST' && complete) { const db = readDB(); const cb = db.callbacks.find(x => x.id === complete[1]); if (!cb) return send(res, 404, { error: 'Callback not found.' }); cb.status = 'Completed'; save(db); return send(res, 200, { state: db }); }
  if (req.method === 'GET') {
    const filePath = path.resolve(PUBLIC, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
    if (!filePath.startsWith(PUBLIC + path.sep) && filePath !== path.join(PUBLIC, 'index.html')) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    fs.readFile(filePath, (err, data) => { if (err) return send(res, 404, 'Not found', 'text/plain; charset=utf-8'); const ext = path.extname(filePath); const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml' }; send(res, 200, data, types[ext] || 'application/octet-stream'); });
    return;
  }
  send(res, 404, { error: 'Not found.' });
}
http.createServer((req, res) => { try { route(req, res); } catch { send(res, 500, { error: 'Something went wrong.' }); } }).listen(PORT, () => console.log(`ClinicLine demo ready at http://localhost:${PORT}`));
