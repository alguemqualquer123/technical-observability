import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createDatabase } from "./db.js";
import { seedIncidents } from "./seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbFile = path.join(rootDir, "data", "incidents.sqlite");

const db = await createDatabase(dbFile);
await db.seed(seedIncidents);

const app = createApp({ db });
const port = Number(process.env.PORT || 3333);

app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
