import { initStateLayer } from "./index";
import { startServer } from "../httpServer";
async function main() {
    initStateLayer();
    await startServer();
}
main().catch((err)=>{
    console.error("Fatal error starting API:", err);
    process.exit(1);
});
