import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { db, initDatabase } from './server/db.ts';

dotenv.config();

initDatabase();

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function isValidHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_TTL_MS })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Invalid or expired session token' });
    return;
  }
  next();
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // ==========================================
  // PUBLIC API ROUTES (No login wall)
  // ==========================================

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/stats', (_req, res) => {
    const stats = db
      .prepare("SELECT * FROM platform_stats WHERE stat_key != 'hardware_listings' ORDER BY id ASC")
      .all();
    res.json({ stats });
  });

  app.get('/api/overview', (_req, res) => {
    const storedStats = db
      .prepare("SELECT * FROM platform_stats WHERE stat_key != 'hardware_listings' ORDER BY id ASC")
      .all() as Array<{
      id: number;
      stat_key: string;
      label: string;
      value: string;
      note: string;
      updated_at: string;
    }>;
    const learningTotal = (
      db.prepare('SELECT COUNT(*) as c FROM learning_resources').get() as { c: number }
    ).c;
    const projectsTotal = (
      db
        .prepare("SELECT COUNT(*) as c FROM student_projects WHERE status = 'approved'")
        .get() as { c: number }
    ).c;
    const eventsTotal = (
      db.prepare('SELECT COUNT(*) as c FROM community_events').get() as { c: number }
    ).c;

    const liveCounts: Record<string, string> = {
      learning_resources: String(learningTotal),
      student_projects: String(projectsTotal),
      community_events: String(eventsTotal),
    };

    const stats = storedStats.map((stat) => ({
      ...stat,
      value: liveCounts[stat.stat_key] ?? stat.value,
    }));

    const learning = db
      .prepare('SELECT * FROM learning_resources ORDER BY is_featured DESC, id ASC LIMIT 6')
      .all();
    const projects = db
      .prepare(
        "SELECT * FROM student_projects WHERE status = 'approved' ORDER BY is_featured DESC, id ASC LIMIT 6"
      )
      .all();
    const competitions = db.prepare('SELECT * FROM competitions ORDER BY id ASC LIMIT 6').all();
    const awsResources = db
      .prepare('SELECT * FROM aws_learning_resources ORDER BY id ASC LIMIT 4')
      .all();
    const events = db.prepare('SELECT * FROM community_events ORDER BY id ASC').all();

    res.json({
      stats,
      learning,
      projects,
      competitions,
      awsResources,
      events,
    });
  });

  app.get('/api/learning', (req, res) => {
    const category = String(req.query.category || '').trim();
    const difficulty = String(req.query.difficulty || '').trim();
    const freeOnly = String(req.query.free || '').trim();
    const q = String(req.query.q || '').trim().toLowerCase();

    const clauses: string[] = [];
    const params: (string | number)[] = [];

    if (category && category !== 'All') {
      clauses.push('category = ?');
      params.push(category);
    }
    if (difficulty && difficulty !== 'All') {
      clauses.push('difficulty = ?');
      params.push(difficulty);
    }
    if (freeOnly === 'free') {
      clauses.push('is_free = 1');
    } else if (freeOnly === 'paid') {
      clauses.push('is_free = 0');
    }
    if (q) {
      clauses.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const items = db
      .prepare(`SELECT * FROM learning_resources ${whereSql} ORDER BY is_featured DESC, id DESC`)
      .all(...params);
    res.json({ items });
  });

  app.get('/api/projects', (req, res) => {
    const category = String(req.query.category || '').trim();
    const q = String(req.query.q || '').trim().toLowerCase();

    const clauses: string[] = ["status = 'approved'"];
    const params: string[] = [];

    if (category && category !== 'All') {
      clauses.push('category = ?');
      params.push(category);
    }
    if (q) {
      clauses.push(
        '(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tech_stack) LIKE ? OR LOWER(author_name) LIKE ?)'
      );
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSql = `WHERE ${clauses.join(' AND ')}`;
    const items = db
      .prepare(`SELECT * FROM student_projects ${whereSql} ORDER BY is_featured DESC, id DESC`)
      .all(...params);
    res.json({ items });
  });

  app.post('/api/projects/submit', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const title = String(body.title || '').trim();
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();
    const tech_stack = String(body.tech_stack || '').trim();
    const author_name = String(body.author_name || '').trim();
    const university = String(body.university || '').trim();
    const github_url = String(body.github_url || '').trim();
    const demo_url = String(body.demo_url || '').trim();

    const allowedCategories = ['AI/ML', 'IoT', 'Web Development', 'Mobile Apps', 'Cloud'];
    if (!title || !allowedCategories.includes(category) || !description || !tech_stack || !author_name) {
      res.status(400).json({ error: 'Please complete all required project fields.' });
      return;
    }
    if (!isValidHttpUrl(github_url) || !isValidHttpUrl(demo_url)) {
      res.status(400).json({ error: 'URLs must start with http:// or https://.' });
      return;
    }

    const info = db
      .prepare(`
        INSERT INTO student_projects
        (title, category, description, tech_stack, author_name, university, github_url, demo_url, image_url, status, is_featured, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0)
      `)
      .run(
        title.slice(0, 140),
        category,
        description.slice(0, 1000),
        tech_stack.slice(0, 200),
        author_name.slice(0, 100),
        university.slice(0, 120),
        github_url.slice(0, 300),
        demo_url.slice(0, 300),
        '/src/assets/images/hero_student_makers_1795281326782.jpg'
      );

    res.status(201).json({
      id: info.lastInsertRowid,
      message: 'Project submitted for review. It will appear publicly once approved by an admin.',
    });
  });

  app.get('/api/competitions', (req, res) => {
    const type = String(req.query.type || '').trim();
    const q = String(req.query.q || '').trim().toLowerCase();

    const clauses: string[] = [];
    const params: string[] = [];

    if (type && type !== 'All') {
      clauses.push('type = ?');
      params.push(type);
    }
    if (q) {
      clauses.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(organizer) LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const items = db
      .prepare(`SELECT * FROM competitions ${whereSql} ORDER BY id DESC`)
      .all(...params);
    res.json({ items });
  });

  app.get('/api/community', (_req, res) => {
    const events = db.prepare('SELECT * FROM community_events ORDER BY id ASC').all();
    res.json({ events });
  });

  app.get('/api/aws-builders', (_req, res) => {
    const resources = db.prepare('SELECT * FROM aws_learning_resources ORDER BY id ASC').all();
    const events = db
      .prepare('SELECT * FROM community_events WHERE is_aws_initiative = 1 ORDER BY id ASC')
      .all();
    res.json({ resources, events });
  });

  app.post('/api/contact', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const submission_type =
      body.submission_type === 'community_join' ? 'community_join' : 'general';
    const sender_name = String(body.sender_name || '').trim();
    const sender_email = String(body.sender_email || '').trim();
    const institution = String(body.institution || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!sender_name || !isValidEmail(sender_email) || !subject || !message) {
      res.status(400).json({ error: 'Name, valid email, subject, and message are required.' });
      return;
    }

    db.prepare(`
      INSERT INTO contact_submissions
      (submission_type, reference_id, reference_title, sender_name, sender_email, institution, subject, message, status)
      VALUES (?, NULL, '', ?, ?, ?, ?, ?, 'new')
    `).run(
      submission_type,
      sender_name.slice(0, 100),
      sender_email.slice(0, 150),
      institution.slice(0, 120),
      subject.slice(0, 180),
      message.slice(0, 1500)
    );

    res.status(201).json({
      message:
        submission_type === 'community_join'
          ? 'Welcome! Your community interest has been received.'
          : 'Thank you for reaching out. Our team will respond via email.',
    });
  });

  // ==========================================
  // PROTECTED ADMIN API ROUTES
  // ==========================================

  app.get('/api/admin/auth-status', (_req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    const existing = db.prepare('SELECT id FROM admin_config WHERE id = 1').get();
    res.json({
      configured: Boolean(envPasscode || existing),
      envOverride: Boolean(envPasscode),
    });
  });

  app.post('/api/admin/setup', (req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPasscode) {
      res.status(409).json({ error: 'Admin passcode is managed via environment configuration.' });
      return;
    }
    const existing = db.prepare('SELECT id FROM admin_config WHERE id = 1').get();
    if (existing) {
      res.status(409).json({ error: 'Admin password has already been claimed.' });
      return;
    }
    const password = String((req.body as Record<string, unknown>).password || '');
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    db.prepare('INSERT INTO admin_config (id, password_hash, salt) VALUES (1, ?, ?)').run(
      hash,
      salt
    );

    res.status(201).json({ token: signAdminToken() });
  });

  app.post('/api/admin/login', (req, res) => {
    const password = String((req.body as Record<string, unknown>).password || '');
    if (!password) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPasscode) {
      if (!safeEqualStrings(password, envPasscode)) {
        res.status(401).json({ error: 'Invalid admin password.' });
        return;
      }
      res.json({ token: signAdminToken() });
      return;
    }

    const row = db
      .prepare('SELECT password_hash, salt FROM admin_config WHERE id = 1')
      .get() as { password_hash: string; salt: string } | undefined;

    if (!row) {
      res.status(400).json({ error: 'Admin password has not been claimed yet.' });
      return;
    }

    const attemptHash = hashPassword(password, row.salt);
    if (!safeEqualStrings(attemptHash, row.password_hash)) {
      res.status(401).json({ error: 'Invalid admin password.' });
      return;
    }

    res.json({ token: signAdminToken() });
  });

  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    res.json({
      stats: db
        .prepare("SELECT * FROM platform_stats WHERE stat_key != 'hardware_listings' ORDER BY id ASC")
        .all(),
      learning: db.prepare('SELECT * FROM learning_resources ORDER BY id DESC').all(),
      projects: db.prepare('SELECT * FROM student_projects ORDER BY id DESC').all(),
      competitions: db.prepare('SELECT * FROM competitions ORDER BY id DESC').all(),
      events: db.prepare('SELECT * FROM community_events ORDER BY id DESC').all(),
      awsResources: db.prepare('SELECT * FROM aws_learning_resources ORDER BY id DESC').all(),
      submissions: db.prepare('SELECT * FROM contact_submissions ORDER BY id DESC').all(),
    });
  });

  app.put('/api/admin/stats/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const body = req.body as Record<string, unknown>;
    const value = String(body.value || '').trim();
    const note = String(body.note || '').trim();
    if (!Number.isInteger(id) || !value) {
      res.status(400).json({ error: 'Valid stat ID and value are required.' });
      return;
    }
    db.prepare(
      'UPDATE platform_stats SET value = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(value.slice(0, 30), note.slice(0, 120), id);
    res.json({ ok: true });
  });

  app.post('/api/admin/learning', requireAdmin, (req, res) => {
    const b = req.body as Record<string, unknown>;
    const title = String(b.title || '').trim();
    const category = String(b.category || '').trim();
    const difficulty = String(b.difficulty || 'Beginner').trim();
    const description = String(b.description || '').trim();
    const is_free = b.is_free ? 1 : 0;
    const price_label = String(b.price_label || (is_free ? 'Free' : 'Paid')).trim();
    const provider = String(b.provider || 'StudentExchange').trim();
    const duration = String(b.duration || 'Self-paced').trim();
    const resource_url = String(b.resource_url || '').trim();

    if (!title || !category || !description || !resource_url || !isValidHttpUrl(resource_url)) {
      res.status(400).json({ error: 'Valid title, category, description, and http(s) URL required.' });
      return;
    }

    const info = db
      .prepare(`
        INSERT INTO learning_resources
        (title, category, difficulty, description, is_free, price_label, provider, duration, resource_url, image_url, is_featured, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '/src/assets/images/learning_cloud_code_1795281329282.jpg', ?, 0)
      `)
      .run(
        title,
        category,
        difficulty,
        description,
        is_free,
        price_label,
        provider,
        duration,
        resource_url,
        b.is_featured ? 1 : 0
      );
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.delete('/api/admin/learning/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM learning_resources WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  app.patch('/api/admin/projects/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const status = String((req.body as Record<string, unknown>).status || '');
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid project status.' });
      return;
    }
    db.prepare('UPDATE student_projects SET status = ? WHERE id = ?').run(status, id);
    res.json({ ok: true });
  });

  app.delete('/api/admin/projects/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM student_projects WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  app.post('/api/admin/competitions', requireAdmin, (req, res) => {
    const b = req.body as Record<string, unknown>;
    const title = String(b.title || '').trim();
    const type = String(b.type || 'Hackathons').trim();
    const organizer = String(b.organizer || '').trim();
    const description = String(b.description || '').trim();
    const deadline = String(b.deadline || '').trim();
    const eligibility = String(b.eligibility || '').trim();
    const prize_or_benefit = String(b.prize_or_benefit || '').trim();
    const registration_url = String(b.registration_url || '').trim();
    const location = String(b.location || 'Online').trim();

    if (!title || !organizer || !description || !registration_url || !isValidHttpUrl(registration_url)) {
      res.status(400).json({ error: 'Valid title, organizer, description, and registration URL required.' });
      return;
    }

    const info = db
      .prepare(`
        INSERT INTO competitions
        (title, type, organizer, description, deadline, eligibility, prize_or_benefit, registration_url, location, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `)
      .run(
        title,
        type,
        organizer,
        description,
        deadline || 'Open',
        eligibility || 'University Students',
        prize_or_benefit,
        registration_url,
        location
      );
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.delete('/api/admin/competitions/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM competitions WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  app.post('/api/admin/events', requireAdmin, (req, res) => {
    const b = req.body as Record<string, unknown>;
    const title = String(b.title || '').trim();
    const community_group = String(b.community_group || 'StudentExchange Community').trim();
    const event_type = String(b.event_type || 'Workshop').trim();
    const event_status = b.event_status === 'past' ? 'past' : 'upcoming';
    const event_date = String(b.event_date || '').trim();
    const location = String(b.location || 'Online').trim();
    const description = String(b.description || '').trim();
    const highlight_note = String(b.highlight_note || '').trim();
    const registration_url = String(b.registration_url || '').trim();
    const is_aws_initiative = b.is_aws_initiative ? 1 : 0;
    const image_url = is_aws_initiative
      ? '/src/assets/images/aws_cloud_builders_1795281329492.jpg'
      : '/src/assets/images/hero_student_makers_1795281326782.jpg';

    if (!title || !event_date || !description || !isValidHttpUrl(registration_url)) {
      res.status(400).json({ error: 'Title, event date, description, and valid URL required.' });
      return;
    }

    const info = db
      .prepare(`
        INSERT INTO community_events
        (title, community_group, event_type, event_status, event_date, location, description, highlight_note, image_url, registration_url, is_aws_initiative, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `)
      .run(
        title,
        community_group,
        event_type,
        event_status,
        event_date,
        location,
        description,
        highlight_note,
        image_url,
        registration_url,
        is_aws_initiative
      );
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM community_events WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  app.post('/api/admin/aws-resources', requireAdmin, (req, res) => {
    const b = req.body as Record<string, unknown>;
    const title = String(b.title || '').trim();
    const service_focus = String(b.service_focus || '').trim();
    const level = String(b.level || 'Foundational').trim();
    const format = String(b.format || 'Workshop').trim();
    const description = String(b.description || '').trim();
    const duration = String(b.duration || '2 Hours').trim();
    const resource_url = String(b.resource_url || '').trim();

    if (!title || !service_focus || !description || !resource_url || !isValidHttpUrl(resource_url)) {
      res.status(400).json({ error: 'Valid title, service focus, description, and URL required.' });
      return;
    }

    const info = db
      .prepare(`
        INSERT INTO aws_learning_resources
        (title, service_focus, level, format, description, duration, resource_url, is_student_led, is_demo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)
      `)
      .run(title, service_focus, level, format, description, duration, resource_url);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.delete('/api/admin/aws-resources/:id', requireAdmin, (req, res) => {
    db.prepare('DELETE FROM aws_learning_resources WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  app.patch('/api/admin/submissions/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const status = String((req.body as Record<string, unknown>).status || 'reviewed');
    if (!['new', 'reviewed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    db.prepare('UPDATE contact_submissions SET status = ? WHERE id = ?').run(status, id);
    res.json({ ok: true });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (!isProd || !fs.existsSync(distDir)) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudentExchange running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
