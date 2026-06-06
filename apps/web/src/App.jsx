import { useEffect, useState } from "react";
import { incidentApi } from "./api.js";

const initialForm = {
  title: "",
  service: "",
  severity: "medium",
  reporter: "",
  assignee: "",
  description: ""
};

const statusOptions = [
  { value: "open", label: "Aberto" },
  { value: "investigating", label: "Investigando" },
  { value: "resolved", label: "Resolvido" }
];

const severityOptions = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" }
];

function metricLabel(key) {
  return {
    total: "Total de incidentes",
    open: "Abertos",
    investigating: "Em investigação",
    resolved: "Resolvidos",
    critical: "Críticos"
  }[key];
}

function badgeClass(type, value) {
  return `${type}-badge ${type}-badge-${value}`;
}

function formatDate(value) {
  if (!value) {
    return "Sem registro";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sem registro";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(parsedDate);
}

function getErrorMessage(error) {
  if (error?.payload?.errors?.length) {
    return error.payload.errors[0].message;
  }

  return error.message || "Não foi possível concluir a ação.";
}

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem("incident-tracker-theme") || "dark";
}

function buildSummary(incidentList) {
  return incidentList.reduce(
    (accumulator, incident) => {
      accumulator.total += 1;
      accumulator[incident.status] += 1;
      if (incident.severity === "critical") {
        accumulator.critical += 1;
      }
      return accumulator;
    },
    {
      total: 0,
      open: 0,
      investigating: 0,
      resolved: 0,
      critical: 0
    }
  );
}

function sortIncidents(incidentList) {
  const severityWeight = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
  };

  return [...incidentList].sort((left, right) => {
    const severityDifference = severityWeight[left.severity] - severityWeight[right.severity];
    if (severityDifference !== 0) {
      return severityDifference;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [resolutionDrafts, setResolutionDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitState, setSubmitState] = useState({ saving: false, error: "", success: "" });
  const [refreshError, setRefreshError] = useState("");

  async function loadDashboard() {
    setRefreshError("");

    try {
      const [summaryData, incidentData] = await Promise.all([
        incidentApi.getSummary(),
        incidentApi.listIncidents()
      ]);

      setSummary(summaryData);
      setIncidents(incidentData.incidents);
    } catch (error) {
      setRefreshError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("incident-tracker-theme", theme);
  }, [theme]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitState({ saving: true, error: "", success: "" });

    try {
      const createdIncident = await incidentApi.createIncident(form);
      const nextIncidents = sortIncidents([createdIncident, ...incidents]);

      setIncidents(nextIncidents);
      setSummary(buildSummary(nextIncidents));
      setForm(initialForm);
      setSubmitState({ saving: false, error: "", success: "Incidente criado com sucesso." });
    } catch (error) {
      setSubmitState({ saving: false, error: getErrorMessage(error), success: "" });
    }
  }

  async function handleStatusChange(incident, status) {
    const payload = {
      status,
      assignee: incident.assignee
    };

    if (status === "resolved") {
      payload.resolutionSummary = resolutionDrafts[incident.id] || "";
    }

    try {
      const updatedIncident = await incidentApi.updateIncident(incident.id, payload);
      const nextIncidents = sortIncidents(
        incidents.map((currentIncident) =>
          currentIncident.id === incident.id ? updatedIncident : currentIncident
        )
      );

      setIncidents(nextIncidents);
      setSummary(buildSummary(nextIncidents));
      setResolutionDrafts((current) => ({
        ...current,
        [incident.id]: updatedIncident.resolutionSummary
      }));
    } catch (error) {
      setRefreshError(getErrorMessage(error));
    }
  }

  if (loading) {
    return <main className="page"><p>Carregando dados do painel...</p></main>;
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Teste técnico</p>
          <h1>Incident Tracker</h1>
          <p className="hero-copy">
            Cadastro e acompanhamento operacional de incidentes com API documentada,
            persistência local e trilha básica de logs para diagnóstico.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
          <button className="ghost-button" type="button" onClick={loadDashboard}>
            Atualizar painel
          </button>
        </div>
      </section>

      {refreshError ? <p className="feedback error">{refreshError}</p> : null}
      {submitState.success ? <p className="feedback success">{submitState.success}</p> : null}
      {submitState.error ? <p className="feedback error">{submitState.error}</p> : null}

      {summary ? (
        <section className="metrics" aria-label="Resumo operacional">
          {Object.entries(summary).map(([key, value]) => (
            <article key={key} className="metric-card">
              <span>{metricLabel(key)}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
      ) : null}

      <section className="content-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Novo incidente</h2>
            <p>Registre o impacto inicial e encaminhe o tratamento.</p>
          </div>

          <label>
            Título
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex.: API de pedidos retornando 502"
            />
          </label>

          <div className="two-columns">
            <label>
              Serviço
              <input
                name="service"
                value={form.service}
                onChange={handleChange}
                placeholder="checkout-api"
              />
            </label>

            <label>
              Severidade
              <select name="severity" value={form.severity} onChange={handleChange}>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="two-columns">
            <label>
              Reportado por
              <input
                name="reporter"
                value={form.reporter}
                onChange={handleChange}
                placeholder="Suporte N2"
              />
            </label>

            <label>
              Responsável inicial
              <input
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
                placeholder="Squad Checkout"
              />
            </label>
          </div>

          <label>
            Descrição
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Detalhe o impacto percebido, escopo e qualquer evidência inicial."
            />
          </label>

          <button className="primary-button" disabled={submitState.saving} type="submit">
            {submitState.saving ? "Salvando..." : "Registrar incidente"}
          </button>
        </form>

        <section className="panel">
          <div className="panel-header">
            <h2>Fila de tratamento</h2>
            <p>Os incidentes são ordenados por severidade e data de abertura.</p>
          </div>

          <div className="incident-list">
            {incidents.map((incident) => (
              <article key={incident.id} className="incident-card">
                <header className="incident-header">
                  <div>
                    <h3>{incident.title}</h3>
                    <p>{incident.service}</p>
                  </div>
                  <div className="incident-badges">
                    <span className={badgeClass("severity", incident.severity)}>{incident.severity}</span>
                    <span className={badgeClass("status", incident.status)}>{incident.status}</span>
                  </div>
                </header>

                <p className="incident-description">{incident.description}</p>

                <dl className="incident-meta">
                  <div>
                    <dt>Reportado por</dt>
                    <dd>{incident.reporter}</dd>
                  </div>
                  <div>
                    <dt>Responsável</dt>
                    <dd>{incident.assignee || "Não definido"}</dd>
                  </div>
                  <div>
                    <dt>Criado em</dt>
                    <dd>{formatDate(incident.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Atualizado em</dt>
                    <dd>{formatDate(incident.updatedAt)}</dd>
                  </div>
                </dl>

                <div className="incident-actions">
                  <label>
                    Status
                    <select
                      value={incident.status}
                      onChange={(event) => handleStatusChange(incident, event.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="resolution-field">
                    Resumo da resolução
                    <textarea
                      rows={3}
                      value={resolutionDrafts[incident.id] ?? incident.resolutionSummary}
                      onChange={(event) =>
                        setResolutionDrafts((current) => ({
                          ...current,
                          [incident.id]: event.target.value
                        }))
                      }
                      placeholder="Obrigatório ao encerrar o incidente."
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
