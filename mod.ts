interface WorkerOptions {
  credentials?: RequestCredentials;
  name?: string;
  type: "module";
}

export interface Sudo {
  run(args: Deno.RunOptions): Deno.Process;
  createWorker(stringUrl: string | URL, options?: WorkerOptions): Worker;
}

export class SudoWorker extends Worker {
}

export async function activate(): Promise<Sudo> {
  return {
    run: Deno.run,
    createWorker(stringUrl: string | URL, options?: WorkerOptions): Worker {
    },
  };
}
