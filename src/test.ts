import { SudoWorker } from "../mod.ts";
const sudoWorker: SudoWorker = new SudoWorker(
  new URL("rooter.ts", import.meta.url).href,
);
const written = await sudoWorker.write({ type: "ping" });
console.log(`Wrote ${written} bytes to the process.`);

for await (const line of sudoWorker.readLines()) {
  console.log(`Got line: ${JSON.stringify(line)}`);
}
