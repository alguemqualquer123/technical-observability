import crypto from "node:crypto";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { createLogger } from "./logger.js";
import { openApiDocument } from "./openapi.js";
import { createIncidentSchema, updateIncidentSchema } from "./validation.js";

function buildIncidentId() {
  return `INC-${crypto.randomInt(1000, 9999)}`;
}

function sendValidationError(error, response) {
  return response.status(400).json({
    message: "Falha de validação.",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }))
  });
}

export function createApp({ db, logger = createLogger() }) {
  const app = express();

  app.use((request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,x-request-id");
    if (request.method === "OPTIONS") {
      return response.status(204).end();
    }
    next();
  });

  app.use(express.json());
  app.use((request, response, next) => {
    request.requestId = request.headers["x-request-id"] || crypto.randomUUID();
    response.setHeader("x-request-id", request.requestId);
    response.on("finish", () => {
      logger.info({
        requestId: request.requestId,
        method: request.method,
        path: request.path,
        statusCode: response.statusCode
      }, "request completed");
    });
    next();
  });

  app.get("/health", async (_request, response) => {
    const summary = await db.getSummary();
    response.json({
      status: "ok",
      database: "ready",
      summary
    });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/openapi.json", (_request, response) => {
    response.json(openApiDocument);
  });

  app.get("/api/incidents", async (request, response) => {
    const incidents = await db.listIncidents({
      status: request.query.status,
      severity: request.query.severity
    });
    response.json({ incidents });
  });

  app.get("/api/incidents/summary", async (_request, response) => {
    const summary = await db.getSummary();
    response.json(summary);
  });

  app.get("/api/incidents/:id", async (request, response) => {
    const incident = await db.getIncidentById(request.params.id);

    if (!incident) {
      return response.status(404).json({ message: "Incidente não encontrado." });
    }

    return response.json(incident);
  });

  app.post("/api/incidents", async (request, response) => {
    const parsed = createIncidentSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(parsed.error, response);
    }

    const now = new Date().toISOString();
    const incident = await db.createIncident({
      id: buildIncidentId(),
      status: "open",
      resolutionSummary: "",
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      ...parsed.data,
      assignee: parsed.data.assignee || ""
    });

    logger.info({
      requestId: request.requestId,
      incidentId: incident.id,
      service: incident.service,
      severity: incident.severity
    }, "incident created");

    return response.status(201).json(incident);
  });

  app.patch("/api/incidents/:id", async (request, response) => {
    const parsed = updateIncidentSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(parsed.error, response);
    }

    const current = await db.getIncidentById(request.params.id);
    if (!current) {
      return response.status(404).json({ message: "Incidente não encontrado." });
    }

    const updated = await db.updateIncident(request.params.id, {
      ...current,
      status: parsed.data.status,
      assignee: parsed.data.assignee || current.assignee,
      resolutionSummary: parsed.data.resolutionSummary || current.resolutionSummary,
      updatedAt: new Date().toISOString(),
      resolvedAt: parsed.data.status === "resolved" ? new Date().toISOString() : null
    });

    logger.info({
      requestId: request.requestId,
      incidentId: updated.id,
      previousStatus: current.status,
      currentStatus: updated.status
    }, "incident status updated");

    return response.json(updated);
  });

  app.use((error, request, response, _next) => {
    logger.error({
      requestId: request.requestId,
      err: error
    }, "unhandled error");

    response.status(500).json({ message: "Erro interno inesperado." });
  });

  return app;
}
