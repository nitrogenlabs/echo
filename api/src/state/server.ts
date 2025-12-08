import { initStateLayer } from "./index.js";
import { startServer } from "../httpServer.js";

async function main() {
  initStateLayer();
  await startServer();
}

main().catch((err) => {
  console.error("Fatal error starting API:", err);
  process.exit(1);
});
