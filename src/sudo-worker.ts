import {
  DenoPermissions,
  getInheritedPermissions,
  ResolvedStructuredPermissions,
  toArgs,
} from "./deno-permissions.ts";

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

export class SudoWorker implements Worker {
  private readonly process: Deno.Process;

  constructor(stringUrl: string | URL, options?: SudoWorkerOptions) {
    this.process = Deno.run({
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
    });
  }
}
