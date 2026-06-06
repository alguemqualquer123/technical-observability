# Teste técnico - desenvolvimento e análise de incidentes

Projeto full stack criado para atender ao desafio proposto, cobrindo:

- front-end funcional com cadastro e acompanhamento de incidentes;
- API REST para gestão de incidentes;
- persistência local em SQLite;
- logs mínimos para apoio ao diagnóstico;
- testes dos cenários principais;
- análise técnica de um incidente recorrente.

O backend possui duas implementacoes da API:

- Java
- JavaScript

## Visão geral

O domínio escolhido foi um pequeno painel de gestão de incidentes operacionais. A aplicação permite:

- cadastrar um novo incidente com validações;
- listar incidentes priorizados por severidade;
- atualizar status de tratamento;
- exigir resumo de resolução ao encerrar um incidente;
- consultar um resumo operacional agregado.

## Stack

- Front-end: React + Vite
- Back-end Java: Spring Boot + JdbcTemplate + SQLite
- Back-end JavaScript: Node.js + Express + `sql.js`
- Persistência: SQLite local
- Testes: Vitest, Supertest e Testing Library

## Estrutura

```text
apps/
  api/       -> backend em JavaScript
  api-java/  -> backend em Java
  web/       -> interface React e testes de interface
```

## Como executar

### Pré-requisitos

- Node.js 20+
- pnpm 10+
- Java 17+
- Maven 3.9+

### Instalação

```bash
pnpm install
```

### Subindo o backend JavaScript

```bash
pnpm dev:api
```

API em `http://localhost:3333`

### Subindo o backend Java

```bash
pnpm dev:api:java
```

API em `http://localhost:3334`

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
- `APP_DATABASE_FILE`: caminho do arquivo SQLite do backend Java

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

Rodar os testes do backend JavaScript e do front-end:

```bash
pnpm test
```

Rodar os testes do backend Java:

```bash
pnpm test:api:java
```

Rodar build dos workspaces JavaScript:

```bash
pnpm build
```

Gerar build do backend Java:

```bash
pnpm build:api:java
```

## Próximos passos naturais

- adicionar autenticação e perfis;
- registrar histórico por transição;
- evoluir a persistência para banco relacional gerenciado;
- expandir observabilidade com métricas e tracing.
