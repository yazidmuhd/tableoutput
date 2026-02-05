// Load Table_Input.csv, render Table 1, then compute and render Table 2.
const statusEl = document.getElementById("status");
const table1Wrap = document.getElementById("table1Wrap");
const table2Wrap = document.getElementById("table2Wrap");

function parseCSV(text) {
  // Minimal CSV parser (assumes no quoted commas in this assessment CSV)
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  return lines.map(line => line.split(",").map(cell => cell.trim()));
}

function buildTable(headers, rows) {
  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(r => {
    const tr = document.createElement("tr");
    r.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function asIntegerDisplay(n) {
  // Requirement: present as an integer.
  // If it’s already integer → show as-is. Otherwise → round to nearest integer.
  if (!Number.isFinite(n)) return "NaN";
  return Number.isInteger(n) ? String(n) : String(Math.round(n));
}

async function main() {
  try {
    statusEl.textContent = "Loading CSV…";
    const res = await fetch("./Table_Input.csv", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load CSV (HTTP ${res.status})`);

    const csvText = await res.text();
    const data = parseCSV(csvText);

    // Expect header row: ["Index #", "Value"]
    const headers = data[0];
    const rows = data.slice(1);

    // Render Table 1
    table1Wrap.innerHTML = "";
    table1Wrap.appendChild(buildTable(headers, rows));

    // Convert Table 1 into lookup: { A5: 2, ... }
    const lookup = {};
    rows.forEach(([idx, val]) => {
      lookup[idx] = toNumber(val);
    });

    // Compute Table 2 values using numeric values (NOT strings)
    const alpha = lookup["A5"] + lookup["A20"];
    const beta = lookup["A15"] / lookup["A7"];
    const charlie = lookup["A13"] * lookup["A12"];

    const table2Headers = ["Category", "Value"];
    const table2Rows = [
      ["Alpha", asIntegerDisplay(alpha)],
      ["Beta", asIntegerDisplay(beta)],
      ["Charlie", asIntegerDisplay(charlie)]
    ];

    // Render Table 2
    table2Wrap.innerHTML = "";
    table2Wrap.appendChild(buildTable(table2Headers, table2Rows));

    statusEl.textContent = "Done.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error: ${err.message}`;
  }
}

main();
