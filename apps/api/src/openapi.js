export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Incident Tracker API",
    version: "1.0.0",
    description: "API usada no desafio técnico para cadastro, listagem e atualização de incidentes."
  },
  servers: [{ url: "http://localhost:3333" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "API saudável"
          }
        }
      }
    },
    "/api/incidents": {
      get: {
        summary: "Lista incidentes",
        parameters: [
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ["open", "investigating", "resolved"] }
          },
          {
            in: "query",
            name: "severity",
            schema: { type: "string", enum: ["low", "medium", "high", "critical"] }
          }
        ],
        responses: {
          200: { description: "Lista de incidentes" }
        }
      },
      post: {
        summary: "Cria um incidente",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "service", "severity", "reporter", "description"],
                properties: {
                  title: { type: "string" },
                  service: { type: "string" },
                  severity: { type: "string" },
                  reporter: { type: "string" },
                  description: { type: "string" },
                  assignee: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Incidente criado" },
          400: { description: "Erro de validação" }
        }
      }
    },
    "/api/incidents/{id}": {
      get: {
        summary: "Detalha um incidente",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Incidente encontrado" },
          404: { description: "Incidente não encontrado" }
        }
      },
      patch: {
        summary: "Atualiza status e responsável",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string" },
                  assignee: { type: "string" },
                  resolutionSummary: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Incidente atualizado" },
          400: { description: "Erro de validação" },
          404: { description: "Incidente não encontrado" }
        }
      }
    },
    "/api/incidents/summary": {
      get: {
        summary: "Resumo operacional",
        responses: {
          200: { description: "Totais por status e severidade" }
        }
      }
    }
  }
};
