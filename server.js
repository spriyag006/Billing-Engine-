const express = require('express');
const Database = require('better-sqlite3');

const db = new Database('billing.db');
db.exec(`
CREATE TABLE IF NOT EXISTS subscriptions(
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, plan TEXT,
  price REAL, status TEXT, next_billing TEXT);
CREATE TABLE IF NOT EXISTS invoices(
  id INTEGER PRIMARY KEY AUTOINCREMENT, sub_id INTEGER, name TEXT,
  plan TEXT, amount REAL, date TEXT);
`);

const PLANS = [
  { name: 'Basic', price: 10 },
  { name: 'Pro', price: 25 },
  { name: 'Enterprise', price: 50 },
];
const addDays = (d, n) => new Date(new Date(d).getTime() + n * 864e5).toISOString();

const makeInvoice = (s) =>
  db.prepare('INSERT INTO invoices(sub_id,name,plan,amount,date) VALUES(?,?,?,?,?)')
    .run(s.id, s.name, s.plan, s.price, new Date().toISOString());

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/api/plans', (req, res) => res.json(PLANS));

app.get('/api/subscriptions', (req, res) =>
  res.json(db.prepare('SELECT * FROM subscriptions ORDER BY id DESC').all()));

app.get('/api/invoices', (req, res) =>
  res.json(db.prepare('SELECT * FROM invoices ORDER BY id DESC').all()));

app.post('/api/subscribe', (req, res) => {
  const { name, plan } = req.body;
  const p = PLANS.find((x) => x.name === plan);
  if (!name || !p) return res.status(400).json({ error: 'Name and valid plan required' });

  const next = addDays(new Date().toISOString(), 30);
  const id = db.prepare(
    'INSERT INTO subscriptions(name,plan,price,status,next_billing) VALUES(?,?,?,?,?)'
  ).run(name, p.name, p.price, 'active', next).lastInsertRowid;

  makeInvoice({ id, name, plan: p.name, price: p.price });
  res.json({ message: 'Subscribed' });
});

app.post('/api/cancel/:id', (req, res) => {
  db.prepare("UPDATE subscriptions SET status='cancelled' WHERE id=?").run(req.params.id);
  res.json({ message: 'Cancelled' });
});

// Billing engine: bills every active subscription that is due
app.post('/api/billing/run', (req, res) => {
  const now = addDays(new Date().toISOString(), Number(req.body.days) || 0);
  const due = db.prepare(
    "SELECT * FROM subscriptions WHERE status='active' AND next_billing<=?"
  ).all(now);

  due.forEach((s) => {
    makeInvoice(s);
    db.prepare('UPDATE subscriptions SET next_billing=? WHERE id=?')
      .run(addDays(s.next_billing, 30), s.id);
  });
  res.json({ message: `${due.length} subscription(s) billed` });
});

app.listen(3000, () => console.log('Running at http://localhost:3000'));