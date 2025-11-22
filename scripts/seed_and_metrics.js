const base = "http://localhost:5000/api";

async function call(path, method, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  const email = `camilo+${Date.now()}@example.com`;
  const password = "test123";
  await call("/auth/register", "POST", { name: "Camilo", email, password });
  const login = await call("/auth/login", "POST", { email, password });
  if (login.status !== 200) {
    console.log(JSON.stringify(login, null, 2));
    process.exit(1);
  }
  const token = login.data.token;
  const today = new Date();
  const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const c1 = await call("/cuts", "POST", { clientName: "Cliente A", amountPaid: 25000, description: "Corte clásico", date: d1.toISOString().slice(0,10) }, token);
  const c2 = await call("/cuts", "POST", { clientName: "Cliente B", amountPaid: 30000, description: "Fade", date: d2.toISOString().slice(0,10) }, token);
  console.log(JSON.stringify({ create1: c1.status, create2: c2.status }, null, 2));
  const mDay = await call("/cuts/metrics?granularity=day", "GET", undefined, token);
  const mMonth = await call("/cuts/metrics?granularity=month", "GET", undefined, token);
  console.log(JSON.stringify({ day: mDay.data, month: mMonth.data }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });