import {
  DenoPermission,
  INHERITED_PERMISSIONS,
  toArgs,
} from "./deno-permission.ts";
import { readLines, writeAll } from "./deps.ts";
import { ListenerRemover, MessageManager } from "./message-manager.ts";
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
    permissions: DenoPermission;
  };
}

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

export class SudoWorker {
  private readonly process: Deno.Process;
  private readonly messageManager: MessageManager = new MessageManager();

  constructor(specifier: string | URL, options?: SudoWorkerOptions) {
    const runOpts = createRunOptions(options);
    console.error(`runOpts = ${JSON.stringify(runOpts, null, 2)}`);
    this.process = Deno.run(runOpts);
  }

  readLines(): AsyncIterableIterator<string> {
    return readLines(this.process.stdout!);
  }

  addMessageListener<M extends Message>(
    type: M["type"],
    listener: (message: M) => void,
  ): ListenerRemover {
    return this.messageManager.addMessageListener(type, listener);
  }

  async postMessage(message: Message): Promise<void> {
    const process: Deno.Process = this.process;
    const stdin: Deno.Writer | null | undefined = process.stdin;
    if (!stdin) throw new Error("ERROR: !this.process.stdin");
    await writeAll(
      stdin,
      new TextEncoder().encode(JSON.stringify(message) + "\n"),
    );
  }

  terminate(): void {
    this.process.kill(9);
    this.process.close();
  }
}
