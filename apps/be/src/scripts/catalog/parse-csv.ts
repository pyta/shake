/** Minimal RFC-style CSV parser (quoted fields, escaped quotes). */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (char === '"') {
      i += 1;
      while (i < content.length) {
        if (content[i] === '"' && content[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (content[i] === '"') {
          i += 1;
          break;
        } else {
          field += content[i];
          i += 1;
        }
      }
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }

    if (char === '\r') {
      i += 1;
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function readCsvTable(content: string): Record<string, string>[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const rows = parseCsv(trimmed);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).flatMap((cells) => {
    const record: Record<string, string> = {};
    let hasValue = false;

    for (let i = 0; i < headers.length; i += 1) {
      const header = headers[i];
      if (!header) continue;
      const value = (cells[i] ?? '').trim();
      if (value) hasValue = true;
      record[header] = value;
    }

    return hasValue ? [record] : [];
  });
}
