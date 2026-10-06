const $ = (s) => document.querySelector(s);
const form = $("#expense-form"),
  descInput = $("#description"),
  amountInput = $("#amount"),
  catInput = $("#category"),
  list = $("#expense-list"),
  totalEl = $("#total"),
  filterEl = $("#filter"),
  breakdownEl = $("#breakdown"),
  catList = $("#categories");

let expenses = [];
try {
  const raw = JSON.parse(localStorage.getItem("expenses"));
  if (Array.isArray(raw))
    expenses = raw.map((e, i) => ({ ...e, id: e.id || Date.now() + i }));
} catch {
  expenses = [];
}

const save = () => {
  try {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  } catch {}
};
const money = (n) => "$" + n.toFixed(2);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = descInput.value.trim(),
    amount = Number(amountInput.value);
  if (!description) return;
  if (!(amount > 0)) return alert("Please enter an amount greater than 0.");
  expenses.push({
    id: Date.now(),
    description,
    amount,
    category: catInput.value.trim() || "General",
    date: new Date().toLocaleDateString(),
  });
  save();
  form.reset();
  descInput.focus();
  render();
});

filterEl.addEventListener("change", render);

$("#clear-btn").addEventListener("click", () => {
  if (
    expenses.length &&
    confirm("Delete ALL expenses? This cannot be undone.")
  ) {
    expenses = [];
    save();
    render();
  }
});

$("#export-btn").addEventListener("click", () => {
  if (!expenses.length) return alert("Nothing to export yet.");
  const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [
    ["Description", "Amount", "Category", "Date"],
    ...expenses.map((e) => [e.description, e.amount, e.category, e.date]),
  ];
  const blob = new Blob(
    ["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\n")],
    { type: "text/csv" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

function render() {
  // categories (filter dropdown + datalist suggestions)
  const cats = [...new Set(expenses.map((e) => e.category))].sort();
  const current = cats.includes(filterEl.value) ? filterEl.value : "all";
  filterEl.replaceChildren(
    new Option("All categories", "all"),
    ...cats.map((c) => new Option(c, c)),
  );
  filterEl.value = current;
  catList.replaceChildren(...cats.map((c) => new Option(c)));

  const shown = expenses.filter(
    (e) => current === "all" || e.category === current,
  );
  const total = shown.reduce((s, e) => s + e.amount, 0);
  totalEl.textContent =
    (current === "all" ? "Total: " : current + ": ") + money(total);

  list.replaceChildren();
  if (!shown.length) {
    const li = document.createElement("li");
    li.className = "empty-msg";
    li.textContent = expenses.length
      ? "No expenses in this category."
      : "No expenses yet. Add your first one above!";
    list.appendChild(li);
  }
  [...shown].reverse().forEach((exp) => {
    const li = document.createElement("li");
    [
      ["expense-desc", exp.description],
      ["expense-amount", money(exp.amount)],
      ["expense-category", exp.category],
      ["expense-date", exp.date],
    ].forEach(([cls, text]) => {
      const s = document.createElement("span");
      s.className = cls;
      s.textContent = text;
      li.appendChild(s);
    });
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete " + exp.description);
    del.addEventListener("click", () => {
      if (!confirm("Delete this expense?")) return;
      expenses = expenses.filter((x) => x.id !== exp.id);
      save();
      render();
    });
    li.appendChild(del);
    list.appendChild(li);
  });

  // breakdown by category
  breakdownEl.replaceChildren();
  const all = expenses.reduce((s, e) => s + e.amount, 0);
  const sums = {};
  expenses.forEach(
    (e) => (sums[e.category] = (sums[e.category] || 0) + e.amount),
  );
  const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
  breakdownEl.hidden = sorted.length < 2;
  sorted.forEach(([name, sum]) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const label = document.createElement("span");
    label.textContent = name + " · " + money(sum);
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = (sum / all) * 100 + "%";
    track.appendChild(fill);
    row.append(label, track);
    breakdownEl.appendChild(row);
  });
}
render();
