# Teste técnico - desenvolvimento e análise de incidentes

Projeto full stack criado para atender ao desafio proposto, cobrindo:

- front-end funcional com cadastro e acompanhamento de incidentes;
- API REST documentada;
- persistência local em SQLite;
- logs mínimos para apoio ao diagnóstico;
- testes dos cenários principais;
- análise técnica de um incidente recorrente.

## Visão geral

O domínio escolhido foi um pequeno painel de gestão de incidentes operacionais. A aplicação permite:

- cadastrar um novo incidente com validações;
- listar incidentes priorizados por severidade;
- atualizar status de tratamento;
- exigir resumo de resolução ao encerrar um incidente;
- consultar um resumo operacional agregado.

## Stack

- Front-end: React + Vite
- Back-end: Node.js + Express
- Persistência: SQLite local via `sql.js`
- Testes: Vitest, Supertest e Testing Library
- Documentação da API: Swagger UI

## Estrutura

```text
apps/
  api/   -> API REST, persistência e testes de integração
  web/   -> interface React e testes de interface
docs/
  incident-analysis.md
  technical-note.md
```

## Como executar

### Pré-requisitos

- Node.js 20+
- pnpm 10+

### Instalação

```bash
pnpm install
```

### Subindo a API

```bash
pnpm dev:api
```

API em `http://localhost:3333`

Documentação Swagger em `http://localhost:3333/docs`

### Subindo o front-end

Em outro terminal:

```bash
pnpm dev:web
```

Aplicação em `http://localhost:5173`

## Variáveis de ambiente

Use o arquivo `.env.example` como referência.

### API

- `PORT`: porta da API
- `CORS_ORIGIN`: origem permitida para o front-end

### Front-end

- `VITE_API_URL`: URL base da API

## Endpoints

### `GET /health`

Retorna o estado básico da aplicação e um resumo agregado.

### `GET /api/incidents`

Lista incidentes.

Query params opcionais:

- `status`: `open | investigating | resolved`
- `severity`: `low | medium | high | critical`

### `GET /api/incidents/:id`

Retorna um incidente específico.

### `GET /api/incidents/summary`

Retorna os totais operacionais:

- `total`
- `open`
- `investigating`
- `resolved`
- `critical`

### `POST /api/incidents`

Cria um incidente.

Exemplo:

```json
{
  "title": "Erro 502 na API de pedidos",
  "service": "checkout-api",
  "severity": "high",
  "reporter": "Suporte N2",
  "assignee": "Squad Checkout",
  "description": "A API passou a retornar 502 após o deploy da versão 4.8.1."
}
```

### `PATCH /api/incidents/:id`

Atualiza o status do incidente.

Exemplo:

```json
{
  "status": "resolved",
  "assignee": "Squad Plataforma",
  "resolutionSummary": "Rollback realizado e timeout da integração ajustado."
}
```

## Logs

Foram incluídos logs estruturados mínimos para:

- conclusão de requisições HTTP;
- criação de incidente;
- mudança de status.

Cada request recebe `x-request-id`, útil para correlação básica em análise de incidente.

## Testes

Rodar todos os testes:

```bash
pnpm test
```

Rodar build dos workspaces:

```bash
pnpm build
```

## Documentos complementares

- Análise do incidente: [docs/incident-analysis.md](./docs/incident-analysis.md)
- Nota técnica: [docs/technical-note.md](./docs/technical-note.md)

## Próximos passos naturais

- adicionar autenticação e perfis;
- registrar histórico por transição;
- evoluir a persistência para banco relacional gerenciado;
- expandir observabilidade com métricas e tracing.
