import fs from "node:fs/promises";
import path from "node:path";
import initSqlJs from "sql.js";

const schema = `
  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    service TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    reporter TEXT NOT NULL,
    assignee TEXT,
    description TEXT NOT NULL,
    resolution_summary TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT
  );
`;

function normalizeIncident(row) {
  return {
    id: row.id,
    title: row.title,
    service: row.service,
    severity: row.severity,
    status: row.status,
    reporter: row.reporter,
    assignee: row.assignee || "",
    description: row.description,
    resolutionSummary: row.resolution_summary || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || null
  };
}

export async function createDatabase(databaseFile) {
  const SQL = await initSqlJs({});
  const fullPath = path.resolve(databaseFile);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  let db;

  try {
    const fileBuffer = await fs.readFile(fullPath);
    db = new SQL.Database(fileBuffer);
  } catch {
    db = new SQL.Database();
  }

  db.run(schema);

  async function persist() {
    const data = db.export();
    await fs.writeFile(fullPath, Buffer.from(data));
  }

  function query(sql, params = []) {
    const statement = db.prepare(sql, params);
    const rows = [];

    while (statement.step()) {
      rows.push(statement.getAsObject());
    }

    statement.free();
    return rows;
  }

  async function execute(sql, params = []) {
    db.run(sql, params);
    await persist();
  }

  return {
    async seed(items) {
      const count = query("SELECT COUNT(*) AS total FROM incidents")[0]?.total || 0;
      if (count > 0) {
        return;
      }

      for (const item of items) {
        await execute(
          `INSERT INTO incidents (
            id, title, service, severity, status, reporter, assignee, description,
            resolution_summary, created_at, updated_at, resolved_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.title,
            item.service,
            item.severity,
            item.status,
            item.reporter,
            item.assignee || null,
            item.description,
            item.resolutionSummary || null,
            item.createdAt,
            item.updatedAt,
            item.resolvedAt || null
          ]
        );
      }
    },
    async listIncidents(filters = {}) {
      const clauses = [];
      const params = [];

      if (filters.status) {
        clauses.push("status = ?");
        params.push(filters.status);
      }

      if (filters.severity) {
        clauses.push("severity = ?");
        params.push(filters.severity);
      }

      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
      const rows = query(
        `SELECT * FROM incidents ${where} ORDER BY
          CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            ELSE 4
          END,
          datetime(created_at) DESC`,
        params
      );

      return rows.map(normalizeIncident);
    },
    async getIncidentById(id) {
      const row = query("SELECT * FROM incidents WHERE id = ?", [id])[0];
      return row ? normalizeIncident(row) : null;
    },
    async createIncident(incident) {
      await execute(
        `INSERT INTO incidents (
          id, title, service, severity, status, reporter, assignee, description,
          resolution_summary, created_at, updated_at, resolved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          incident.id,
          incident.title,
          incident.service,
          incident.severity,
          incident.status,
          incident.reporter,
          incident.assignee || null,
          incident.description,
          incident.resolutionSummary || null,
          incident.createdAt,
          incident.updatedAt,
          incident.resolvedAt || null
        ]
      );

      return this.getIncidentById(incident.id);
    },
    async updateIncident(id, changes) {
      const current = await this.getIncidentById(id);
      if (!current) {
        return null;
      }

      const next = {
        ...current,
        ...changes,
        updatedAt: changes.updatedAt
      };

      await execute(
        `UPDATE incidents SET
          title = ?,
          service = ?,
          severity = ?,
          status = ?,
          reporter = ?,
          assignee = ?,
          description = ?,
          resolution_summary = ?,
          updated_at = ?,
          resolved_at = ?
        WHERE id = ?`,
        [
          next.title,
          next.service,
          next.severity,
          next.status,
          next.reporter,
          next.assignee || null,
          next.description,
          next.resolutionSummary || null,
          next.updatedAt,
          next.resolvedAt || null,
          id
        ]
      );

      return this.getIncidentById(id);
    },
    async getSummary() {
      const rows = query(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count,
          SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) AS investigating_count,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) AS critical_count
        FROM incidents`
      )[0];

      return {
        total: Number(rows.total || 0),
        open: Number(rows.open_count || 0),
        investigating: Number(rows.investigating_count || 0),
        resolved: Number(rows.resolved_count || 0),
        critical: Number(rows.critical_count || 0)
      };
    }
  };
}
