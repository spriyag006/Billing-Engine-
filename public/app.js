const $ = (id) => document.getElementById(id);

async function api(path, method = 'GET', body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function load() {
  const plans = await api('/plans');
  $('plan').innerHTML = plans.map((p) => `<option>${p.name}</option>`).join('');

  const subs = await api('/subscriptions');
  $('subs').innerHTML = subs.map((s) => `
    <tr>
      <td>${s.name}</td><td>${s.plan} ($${s.price})</td><td>${s.status}</td>
      <td>${new Date(s.next_billing).toLocaleDateString()}</td>
      <td>${s.status === 'active'
        ? `<button class="red" onclick="cancelSub(${s.id})">Cancel</button>` : ''}</td>
    </tr>`).join('');

  const inv = await api('/invoices');
  $('invoices').innerHTML = inv.map((i) => `
    <tr><td>${i.id}</td><td>${i.name}</td><td>${i.plan}</td>
    <td>$${i.amount}</td><td>${new Date(i.date).toLocaleString()}</td></tr>`).join('');
}

$('subscribeBtn').onclick = async () => {
  try {
    await api('/subscribe', 'POST', { name: $('name').value, plan: $('plan').value });
    $('name').value = '';
    load();
  } catch (e) { alert(e.message); }
};

window.cancelSub = async (id) => { await api('/cancel/' + id, 'POST'); load(); };

$('billBtn').onclick = async () => {
  const r = await api('/billing/run', 'POST', { days: $('days').value });
  $('msg').textContent = r.message;
  load();
};

load();