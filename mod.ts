import { SudoProxyHandler } from "./proxy-handler.ts";

export type SudoRunOptions = Exclude<
  Deno.RunOptions,
  "cmd" | "stdout" | "stderr" | "stdin"
>;

export class SudoProcess {
  readonly process: Deno.Process;

  constructor(
    asUser: string = "root",
    extraDenoArgs: string[] = [],
    runOptions?: SudoRunOptions,
  ) {
    const delegatePath: string = new URL("./delegate.ts", import.meta.url)
      .toString();

    this.process = Deno.run({
      ...runOptions,
      cmd: [
        "sudo",
        Deno.execPath(),
        ...extraDenoArgs,
        delegatePath,
      ],
    });
  }

  async import(url: string | URL): Promise<unknown> {
    return new Proxy(
      {},
      new SudoProxyHandler(),
    );
  }
}
