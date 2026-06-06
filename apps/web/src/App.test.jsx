import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

const summaryResponse = {
  total: 2,
  open: 1,
  investigating: 1,
  resolved: 0,
  critical: 1
};

const incidentResponse = {
  incidents: [
    {
      id: "INC-1002",
      title: "Fila de pagamentos acumulando mensagens",
      service: "payment-worker",
      severity: "critical",
      status: "open",
      reporter: "Monitoramento",
      assignee: "Operações",
      description: "A fila principal de pagamentos ultrapassou o limite esperado.",
      resolutionSummary: "",
      createdAt: "2026-06-06T08:15:00.000Z",
      updatedAt: "2026-06-06T08:15:00.000Z",
      resolvedAt: null
    }
  ]
};

describe("App", () => {
  beforeEach(() => {
    global.fetch = vi.fn((url, options) => {
      if (url.toString().includes("/summary")) {
        return Promise.resolve({
          ok: true,
          json: async () => summaryResponse
        });
      }

      if (!options && url.toString().includes("/api/incidents")) {
        return Promise.resolve({
          ok: true,
          json: async () => incidentResponse
        });
      }

      if (options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "INC-2001",
            status: "open"
          })
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => incidentResponse
      });
    });
  });

  it("renderiza métricas e lista inicial", async () => {
    render(<App />);

    expect(await screen.findByText("Total de incidentes")).toBeInTheDocument();
    expect(screen.getByText("Fila de pagamentos acumulando mensagens")).toBeInTheDocument();
  });

  it("submete um novo incidente", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Novo incidente");

    await user.type(screen.getByLabelText("Título"), "Falha no sincronismo de estoque");
    await user.type(screen.getByLabelText("Serviço"), "inventory-sync");
    await user.type(screen.getByLabelText("Reportado por"), "Operações");
    await user.type(screen.getByLabelText("Responsável inicial"), "Squad ERP");
    await user.type(
      screen.getByLabelText("Descrição"),
      "O sincronismo com o ERP começou a atrasar e pedidos recentes não aparecem no painel."
    );

    await user.click(screen.getByRole("button", { name: "Registrar incidente" }));

    await waitFor(() => {
      expect(screen.getByText("Incidente criado com sucesso.")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/incidents"),
      expect.objectContaining({ method: "POST" })
    );
  });
});
