/**
 * In-memory SQLite-compatible adapter for web.
 * expo-sqlite v15 has no web export, so we shim the small SQL surface this
 * app uses. Persists tables in localStorage so Playwright reloads survive
 * within a session, but otherwise behaves like a fresh DB on first load.
 */

type Row = Record<string, unknown>;

const STORAGE_KEY = 'daily-habits.web-db.v1';

function loadFromStorage(): Record<string, Row[]> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Row[]>) : {};
  } catch {
    return {};
  }
}

function saveToStorage(tables: Map<string, Row[]>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const obj: Record<string, Row[]> = {};
    tables.forEach((rows, name) => {
      obj[name] = rows;
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* quota exceeded — drop persistence */
  }
}

export class WebDatabase {
  private tables: Map<string, Row[]> = new Map();

  constructor() {
    const persisted = loadFromStorage();
    Object.entries(persisted).forEach(([name, rows]) => {
      this.tables.set(name, rows);
    });
  }

  private persist(): void {
    saveToStorage(this.tables);
  }

  private ensureTable(name: string): Row[] {
    let arr = this.tables.get(name);
    if (!arr) {
      arr = [];
      this.tables.set(name, arr);
    }
    return arr;
  }

  async execAsync(sql: string): Promise<void> {
    const stmts = splitStatements(sql);
    for (const stmt of stmts) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      const upper = trimmed.toUpperCase();
      if (upper.startsWith('PRAGMA') || upper.startsWith('CREATE INDEX')) continue;
      let m = trimmed.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
      if (m) {
        this.ensureTable(m[1]);
        continue;
      }
      m = trimmed.match(/^DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
      if (m) {
        this.tables.delete(m[1]);
        continue;
      }
      m = trimmed.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/is);
      if (m) {
        const table = m[1];
        const where = m[2];
        const rows = this.tables.get(table) ?? [];
        if (!where) {
          this.tables.set(table, []);
        } else {
          this.tables.set(
            table,
            rows.filter((row) => !matchesWhere(row, where, []))
          );
        }
        continue;
      }
      // ignore anything else inside execAsync
    }
    this.persist();
  }

  async runAsync(
    sql: string,
    ...args: unknown[]
  ): Promise<{ lastInsertRowId: number; changes: number }> {
    const params = flattenParams(args);
    const trimmed = sql.trim().replace(/;\s*$/, '');

    let m = trimmed.match(
      /^INSERT\s+(OR\s+IGNORE\s+)?INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)(?:\s+ON\s+CONFLICT\s*\((\w+)\)\s+DO\s+UPDATE\s+SET\s+(.+))?$/is
    );
    if (m) {
      const isIgnore = !!m[1];
      const table = m[2];
      const cols = m[3].split(',').map((s) => s.trim());
      const valTokens = splitCsv(m[4]).map((s) => s.trim());
      const conflictCol = m[5];
      const upsertSet = m[6];

      const arr = this.ensureTable(table);
      const row: Row = {};
      let pIdx = 0;
      cols.forEach((col, i) => {
        const tok = valTokens[i];
        if (tok === '?') {
          row[col] = params[pIdx++];
        } else if (tok.toUpperCase() === 'NULL') {
          row[col] = null;
        } else if (/^['"].*['"]$/.test(tok)) {
          row[col] = tok.slice(1, -1);
        } else if (!isNaN(Number(tok))) {
          row[col] = Number(tok);
        } else {
          row[col] = tok;
        }
      });

      const conflictKeys = uniqueKeysFor(table);
      const conflictMatch = arr.find((existing) =>
        conflictKeys.some((keys) =>
          keys.every((k) => existing[k] === row[k])
        )
      );

      if (conflictMatch) {
        if (conflictCol && upsertSet) {
          // ON CONFLICT DO UPDATE
          const setPairs = upsertSet.split(/,(?![^(]*\))/).map((p) => p.trim());
          for (const pair of setPairs) {
            const sm = pair.match(/^(\w+)\s*=\s*(.+)$/);
            if (!sm) continue;
            const col = sm[1];
            const expr = sm[2].trim();
            const ex = expr.match(/^excluded\.(\w+)$/i);
            if (ex) {
              conflictMatch[col] = row[ex[1]];
            } else if (expr === '?') {
              conflictMatch[col] = params[pIdx++];
            }
          }
          this.persist();
          return { lastInsertRowId: 0, changes: 1 };
        }
        if (isIgnore) {
          return { lastInsertRowId: 0, changes: 0 };
        }
      }

      arr.push(row);
      this.persist();
      return { lastInsertRowId: arr.length, changes: 1 };
    }

    m = trimmed.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)$/is);
    if (m) {
      const table = m[1];
      const setClause = m[2];
      const whereClause = m[3];
      const setPairs = setClause.split(/,(?![^(]*\))/).map((s) => {
        const idx = s.indexOf('=');
        return [s.slice(0, idx).trim(), s.slice(idx + 1).trim()] as const;
      });
      const setParamCount = setPairs.filter(([, v]) => v === '?').length;
      const setVals = params.slice(0, setParamCount);
      const whereVals = params.slice(setParamCount);
      const arr = this.tables.get(table) ?? [];
      let changes = 0;
      const updated = arr.map((row) => {
        if (matchesWhere(row, whereClause, whereVals)) {
          const newRow = { ...row };
          let pi = 0;
          for (const [col, val] of setPairs) {
            if (val === '?') newRow[col] = setVals[pi++];
            else if (val.toUpperCase() === 'NULL') newRow[col] = null;
            else if (/^['"].*['"]$/.test(val)) newRow[col] = val.slice(1, -1);
            else if (!isNaN(Number(val))) newRow[col] = Number(val);
            else newRow[col] = val;
          }
          changes++;
          return newRow;
        }
        return row;
      });
      this.tables.set(table, updated);
      this.persist();
      return { lastInsertRowId: 0, changes };
    }

    m = trimmed.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/is);
    if (m) {
      const table = m[1];
      const whereClause = m[2];
      const arr = this.tables.get(table) ?? [];
      const kept = whereClause
        ? arr.filter((row) => !matchesWhere(row, whereClause, params))
        : [];
      const changes = arr.length - kept.length;
      this.tables.set(table, kept);
      this.persist();
      return { lastInsertRowId: 0, changes };
    }

    throw new Error(`[web-db] unsupported runAsync: ${sql}`);
  }

  async getAllAsync<T = Row>(sql: string, ...args: unknown[]): Promise<T[]> {
    const params = flattenParams(args);
    const m = sql
      .trim()
      .replace(/;\s*$/, '')
      .match(
        /^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/is
      );
    if (!m) throw new Error(`[web-db] unsupported SELECT: ${sql}`);
    const cols = m[1].trim();
    const table = m[2];
    const whereClause = m[3];
    const orderBy = m[4];
    const limit = m[5] ? Number(m[5]) : undefined;
    let rows = (this.tables.get(table) ?? []).slice();
    if (whereClause) rows = rows.filter((row) => matchesWhere(row, whereClause, params));
    if (orderBy) rows.sort((a, b) => compareByOrderBy(a, b, orderBy));
    if (limit !== undefined) rows = rows.slice(0, limit);
    if (cols !== '*') {
      const colNames = cols.split(',').map((s) => s.trim());
      rows = rows.map((row) => {
        const r: Row = {};
        colNames.forEach((c) => {
          r[c] = row[c];
        });
        return r;
      });
    }
    return rows.map((r) => ({ ...r })) as T[];
  }

  async getFirstAsync<T = Row>(sql: string, ...args: unknown[]): Promise<T | null> {
    const all = await this.getAllAsync<T>(sql, ...args);
    return all[0] ?? null;
  }
}

/* ---- helpers ---- */

function flattenParams(args: unknown[]): unknown[] {
  if (args.length === 1 && Array.isArray(args[0])) return args[0] as unknown[];
  return args;
}

function splitStatements(sql: string): string[] {
  // Naive split on semicolons; safe for our schema/seed since no string
  // literals contain semicolons.
  return sql.split(';').map((s) => s.trim()).filter(Boolean);
}

function splitCsv(input: string): string[] {
  // Splits on commas that are not inside parens/quotes — sufficient for our
  // VALUES tuples which are flat.
  const parts: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of input) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

function uniqueKeysFor(table: string): string[][] {
  // Conflict-detection keys per table, in priority order.
  if (table === 'schema_meta') return [['key']];
  if (table === 'habits') return [['id']];
  if (table === 'habit_completions') return [['id'], ['habit_id', 'date']];
  return [['id']];
}

function matchesWhere(row: Row, where: string, params: unknown[]): boolean {
  const conditions = where.split(/\s+AND\s+/i);
  let pIdx = 0;
  for (const raw of conditions) {
    const cond = raw.trim();
    let cm = cond.match(/^(\w+)\s+IS\s+NULL$/i);
    if (cm) {
      if (row[cm[1]] != null) return false;
      continue;
    }
    cm = cond.match(/^(\w+)\s+IS\s+NOT\s+NULL$/i);
    if (cm) {
      if (row[cm[1]] == null) return false;
      continue;
    }
    cm = cond.match(/^(\w+)\s*=\s*\?$/);
    if (cm) {
      if (row[cm[1]] !== params[pIdx++]) return false;
      continue;
    }
    cm = cond.match(/^(\w+)\s*=\s*'([^']*)'$/);
    if (cm) {
      if (row[cm[1]] !== cm[2]) return false;
      continue;
    }
    cm = cond.match(/^(\w+)\s*=\s*(-?\d+(?:\.\d+)?)$/);
    if (cm) {
      if (Number(row[cm[1]]) !== Number(cm[2])) return false;
      continue;
    }
    throw new Error(`[web-db] unsupported WHERE clause: ${cond}`);
  }
  return true;
}

function compareByOrderBy(a: Row, b: Row, orderBy: string): number {
  const parts = orderBy.split(/,/).map((s) => s.trim());
  for (const part of parts) {
    let m = part.match(/^datetime\s*\(\s*(\w+)\s*\)\s*(ASC|DESC)?$/i);
    let col: string;
    let dir: 'ASC' | 'DESC';
    let isDate = false;
    if (m) {
      col = m[1];
      dir = ((m[2] ?? 'ASC').toUpperCase() as 'ASC' | 'DESC');
      isDate = true;
    } else {
      m = part.match(/^(\w+)\s*(ASC|DESC)?$/i);
      if (!m) continue;
      col = m[1];
      dir = ((m[2] ?? 'ASC').toUpperCase() as 'ASC' | 'DESC');
    }
    const av = a[col];
    const bv = b[col];
    let cmp = 0;
    if (isDate) {
      const ad = new Date(String(av ?? 0)).getTime();
      const bd = new Date(String(bv ?? 0)).getTime();
      cmp = ad - bd;
    } else if (av == null && bv == null) {
      cmp = 0;
    } else if (av == null) {
      cmp = -1;
    } else if (bv == null) {
      cmp = 1;
    } else if (av < bv) {
      cmp = -1;
    } else if (av > bv) {
      cmp = 1;
    }
    if (cmp !== 0) return dir === 'ASC' ? cmp : -cmp;
  }
  return 0;
}
