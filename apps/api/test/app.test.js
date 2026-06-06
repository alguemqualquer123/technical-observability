import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/db.js";
import { seedIncidents } from "../src/seed.js";

async function buildTestApp() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "incident-api-"));
  const db = await createDatabase(path.join(tempDir, "test.sqlite"));
  await db.seed(seedIncidents);
  const app = createApp({
    db,
    logger: {
      info() {},
      error() {}
    }
  });

  return { app };
}

describe("incident api", () => {
  let app;

  beforeEach(async () => {
    ({ app } = await buildTestApp());
  });

  it("lista incidentes cadastrados", async () => {
    const response = await request(app).get("/api/incidents");

    expect(response.status).toBe(200);
    expect(response.body.incidents).toHaveLength(2);
  });

  it("cria um incidente válido", async () => {
    const response = await request(app)
      .post("/api/incidents")
      .send({
        title: "Erro 500 ao consultar histórico do cliente",
        service: "customer-api",
        severity: "medium",
        reporter: "Suporte",
        description: "Ao abrir o histórico do cliente, a tela falha para um subconjunto de contas antigas.",
        assignee: "Time Core"
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("open");
    expect(response.body.id).toMatch(/^INC-/);
  });

  it("rejeita atualização resolvida sem resumo", async () => {
    const response = await request(app)
      .patch("/api/incidents/INC-1002")
      .send({
        status: "resolved"
      });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe("resolutionSummary");
  });

  it("retorna resumo operacional", async () => {
    const response = await request(app).get("/api/incidents/summary");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.critical).toBe(1);
  });
});
