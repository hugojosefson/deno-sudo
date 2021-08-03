import { SudoWorker } from "./mod.ts";
import { Ready } from "./src/message.ts";
const sudoWorker: SudoWorker = new SudoWorker(
  new URL("rooter.ts", import.meta.url).href,
);

sudoWorker.addMessageListener("ready", (message: Ready) => {
  console.log(`Got message: ${JSON.stringify(message)}`);
});

await sudoWorker.postMessage({ type: "ready" });
