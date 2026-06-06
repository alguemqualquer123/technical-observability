export const seedIncidents = [
  {
    id: "INC-1001",
    title: "Latência elevada na API de autenticação",
    service: "auth-service",
    severity: "high",
    status: "investigating",
    reporter: "NOC",
    assignee: "Squad Plataforma",
    description: "Usuários reportaram aumento no tempo de login após o deploy da versão 2.14.3.",
    resolutionSummary: "",
    createdAt: "2026-06-05T11:20:00.000Z",
    updatedAt: "2026-06-05T12:05:00.000Z",
    resolvedAt: null
  },
  {
    id: "INC-1002",
    title: "Fila de pagamentos acumulando mensagens",
    service: "payment-worker",
    severity: "critical",
    status: "open",
    reporter: "Monitoramento",
    assignee: "Operações",
    description: "A fila principal de pagamentos ultrapassou o limite esperado e já impacta o prazo de confirmação.",
    resolutionSummary: "",
    createdAt: "2026-06-06T08:15:00.000Z",
    updatedAt: "2026-06-06T08:15:00.000Z",
    resolvedAt: null
  }
];
