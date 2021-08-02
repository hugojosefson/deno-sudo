import {
  DenoPermissions,
  getInheritedPermissions,
  ResolvedStructuredPermissions,
  toArgs,
} from "./deno-permissions.ts";
import { readLines } from "./deps.ts";
import { Message } from "./message.ts";

const DELEGATE_PATH: string = new URL("./delegate.ts", import.meta.url)
  .toString();

export interface SudoOptions {
  asUser?: string;
  cwd?: string;
  env?: Record<string, string>;
}

export interface SudoWorkerOptions {
  credentials?: RequestCredentials;
  name?: string;
  type: "module";
  sudo?: SudoOptions;
  deno?: {
    namespace: boolean;
    permissions: DenoPermissions;
  };
}

const INHERITED_PERMISSIONS: ResolvedStructuredPermissions =
  await getInheritedPermissions();

function createRunOptions(options?: SudoWorkerOptions): Deno.RunOptions {
  return {
    cmd: [
      "sudo",
      "-u",
      options?.sudo?.asUser ?? "root",
      Deno.execPath(),
      "run",
      ...toArgs(options?.deno?.permissions, INHERITED_PERMISSIONS),
      DELEGATE_PATH,
    ],
    cwd: options?.sudo?.cwd,
    env: options?.sudo?.env,
    stdout: "piped",
    stderr: "piped",
    stdin: "piped",
  };
}

export class SudoWorker implements Worker {
  private readonly process: Deno.Process;

  constructor(specifier: string | URL, options?: SudoWorkerOptions) {
    const runOpts = createRunOptions(options);
    console.error(`runOpts = ${JSON.stringify(runOpts, null, 2)}`);
    this.process = Deno.run(runOpts);
  }
  readLines(): AsyncIterableIterator<string> {
    return readLines(this.process.stdout!);
  }
  write(message: Message): Promise<number> {
    const process = this.process;
    const stdin = process.stdin;
    if (!stdin) throw new Error("ERROR: !this.process.stdin");
    return stdin.write(
      new TextEncoder().encode(JSON.stringify(message) + "\n"),
    );
  }
}
