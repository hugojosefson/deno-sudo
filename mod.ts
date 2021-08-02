const DELEGATE_PATH: string = new URL("./delegate.ts", import.meta.url)
  .toString();

export interface SudoOptions {
  asUser?: string;
  cwd?: string;
  env?: Record<string, string>;
}

export type DenoPermissions = "inherit" | "none" | {
  env: boolean | "inherit" | "none" | string[];
  hrtime: boolean | "inherit" | "none";
  net: boolean | "inherit" | "none" | string[];
  plugin: boolean | "inherit" | "none";
  read: boolean | "inherit" | "none" | string[];
  run: boolean | "inherit" | "none" | string[];
  write: boolean | "inherit" | "none" | string[];
};

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

function getDenoArgs(permissions: DenoPermissions = "inherit"): string[] {}

export class SudoWorker implements Worker {
  private readonly process: Deno.Process;

  constructor(stringUrl: string | URL, options?: SudoWorkerOptions) {
    const asUser = options?.sudo?.asUser ?? "root";
    const denoArgs = getDenoArgs(options?.deno?.permissions);
    this.process = Deno.run({
      cmd: [
        "sudo",
        "-u",
        asUser,
        Deno.execPath(),
        ...denoArgs,
        DELEGATE_PATH,
      ],
    });
  }
}
