/**
 * Ensures output-root-children exists in sockets-matrix.csv with the same
 * UI input-*-id targets as output-column-children.
 */
const fs = require('fs');
const path = require('path');

const matrixPath = path.join(__dirname, '..', 'sockets-matrix.csv');

function parseLine(line) {
  const out = [];
  let cur = '';
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
    } else if (c === ',') {
      out.push(cur);
      cur = '';
      i++;
    } else {
      cur += c;
      i++;
    }
  }
  out.push(cur);
  return out;
}

const raw = fs.readFileSync(matrixPath, 'utf8');
const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
const header = parseLine(lines[0]);
if (!header.includes('output-root-children')) {
  header.push('output-root-children');
}
const colNames = header.slice(1);

const targets = new Set([
  'input-tile-id',
  'input-column-id',
  'input-box-id',
  'input-grid-id',
  'input-or-id',
  'input-not-id',
  'input-header-id',
  'input-range-id',
]);

const rows = [];
for (let r = 1; r < lines.length; r++) {
  const cells = parseLine(lines[r]);
  const name = cells[0];
  const map = {};
  for (let c = 1; c < header.length; c++) {
    const col = header[c];
    map[col] = (cells[c] ?? '').trim();
  }
  for (const col of colNames) {
    if (!(col in map)) map[col] = '';
  }
  rows.push({ name, map });
}

let rootRow = rows.find((r) => r.name === 'output-root-children');
if (!rootRow) {
  const map = {};
  for (const col of colNames) {
    map[col] = targets.has(col) ? 'x' : '';
  }
  rootRow = { name: 'output-root-children', map };
  rows.push(rootRow);
} else {
  for (const t of targets) {
    rootRow.map[t] = 'x';
  }
}

const outLines = [header.join(',')];
for (const row of rows) {
  outLines.push([row.name, ...colNames.map((c) => row.map[c] || '')].join(','));
}
fs.writeFileSync(matrixPath, outLines.join('\n') + '\n', 'utf8');
console.log(`Updated ${matrixPath} (${colNames.length} cols, ${rows.length} rows)`);
