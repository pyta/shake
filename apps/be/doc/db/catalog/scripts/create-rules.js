/**
 * Generates ../rules.csv from ../sockets-matrix.csv.
 * For each cell containing "x", emits two rows: A,B and B,A
 * (A = row label from first column, B = column label from first row).
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const matrixPath = path.join(root, "sockets-matrix.csv");
const rulesPath = path.join(root, "rules.csv");

function parseLine(line) {
  const out = [];
  let cur = "";
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === '"') {
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          cur += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          cur += line[i];
          i++;
        }
      }
    } else if (c === ",") {
      out.push(cur);
      cur = "";
      i++;
    } else {
      cur += c;
      i++;
    }
  }
  out.push(cur);
  return out;
}

function main() {
  const raw = fs.readFileSync(matrixPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error(`Expected header + data rows in ${matrixPath}`);
  }

  const headerCells = parseLine(lines[0]);
  const colNames = headerCells.slice(1);

  const seen = new Set();
  const rows = [];

  for (let r = 1; r < lines.length; r++) {
    const cells = parseLine(lines[r]);
    const rowName = cells[0]?.trim() ?? "";
    if (!rowName) continue;

    for (let c = 1; c < cells.length && c - 1 < colNames.length; c++) {
      const cell = (cells[c] ?? "").trim().toLowerCase();
      if (cell !== "x") continue;

      const colName = (colNames[c - 1] ?? "").trim();
      if (!colName) continue;

      const a = rowName;
      const b = colName;
      for (const [from, to] of [
        [a, b],
        [b, a],
      ]) {
        const key = `${from}\t${to}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push([from, to]);
      }
    }
  }

  const body = rows.map(([from, to]) => `${from},${to}`).join("\n");
  fs.writeFileSync(rulesPath, `From,To\n${body}\n`, "utf8");
  console.log(`Wrote ${rows.length} rule rows to ${rulesPath}`);
}

main();
