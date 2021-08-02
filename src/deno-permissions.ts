export interface ResolvedStructuredPermissions {
  hrtime: boolean;
  plugin: boolean;
  env: boolean | string[];
  net: boolean | string[];
  read: boolean | string[];
  run: boolean | string[];
  write: boolean | string[];
}

export type StructuredPermissions = {
  hrtime: boolean | "inherit" | "none";
  plugin: boolean | "inherit" | "none";
  env: boolean | "inherit" | "none" | string[];
  net: boolean | "inherit" | "none" | string[];
  read: boolean | "inherit" | "none" | string[];
  run: boolean | "inherit" | "none" | string[];
  write: boolean | "inherit" | "none" | string[];
};

export type DenoPermissions = "inherit" | "none" | StructuredPermissions;

async function getInheritedPermission(
  name: Deno.PermissionName,
): Promise<boolean> {
  return (await Deno.permissions.query({ name })).state === "granted";
}

export async function getInheritedPermissions(): Promise<
  ResolvedStructuredPermissions
> {
  return {
    hrtime: await getInheritedPermission("hrtime"),
    plugin: await getInheritedPermission("plugin"),
    env: await getInheritedPermission("env"),
    net: await getInheritedPermission("net"),
    read: await getInheritedPermission("read"),
    run: await getInheritedPermission("run"),
    write: await getInheritedPermission("write"),
  };
}

function resolvePermission(
  value: boolean | "inherit" | "none" | string[],
  inherited?: boolean | string[],
): boolean | string[] {
  if (value === false || value === "none") {
    return false;
  }
  if (value === true) {
    return true;
  }
  if (value === "inherit") {
    if (typeof inherited === "undefined") {
      throw new Error(
        "If permissions contains 'inherit' anywhere, then you must supply inherited. Example: toArgs({env: 'inherit'}, await getInheritedPermissions())",
      );
    }
    return inherited;
  }
  return value;
}

function resolvePermissionAsBoolean(
  value: boolean | "inherit" | "none" | string[],
  inherited?: boolean,
): boolean {
  return !!resolvePermission(value, inherited);
}

function resolvePermissions(
  permissions: StructuredPermissions,
  inherited?: ResolvedStructuredPermissions,
): ResolvedStructuredPermissions {
  return {
    hrtime: resolvePermissionAsBoolean(permissions.hrtime, inherited?.hrtime),
    plugin: resolvePermissionAsBoolean(permissions.plugin, inherited?.plugin),
    env: resolvePermission(permissions.env, inherited?.env),
    net: resolvePermission(permissions.net, inherited?.net),
    read: resolvePermission(permissions.read, inherited?.read),
    run: resolvePermission(permissions.run, inherited?.run),
    write: resolvePermission(permissions.write, inherited?.write),
  };
}

export function toArgs(permissions: "none"): string[];
export function toArgs(
  permissions: ResolvedStructuredPermissions,
): string[];
export function toArgs(
  permissions:
    | undefined
    | "inherit"
    | StructuredPermissions
    | "none"
    | ResolvedStructuredPermissions,
  inherited: ResolvedStructuredPermissions,
): string[];

export function toArgs(
  permissions: undefined | DenoPermissions = "inherit",
  inherited?: ResolvedStructuredPermissions,
): string[] {
  if (permissions === "none") return [];
  if (permissions === "inherit") {
    if (!inherited) {
      throw new Error(
        "If permissions === 'inherit', then you must supply inherited. Example: toArgs('inherit', await getInheritedPermissions())",
      );
    }
    return toArgs(inherited);
  }
  return toArgs_(resolvePermissions(permissions, inherited));
}

function toArgs_(permissions: ResolvedStructuredPermissions): string[] {
  return Object.entries(permissions).flatMap(
    (
      [nameString, valueAny],
    ) => {
      const name: Deno.PermissionName = nameString as Deno.PermissionName;
      const value: undefined | boolean | string[] = valueAny as
        | undefined
        | boolean
        | string[];

      if (value === false) {
        return [];
      }
      if (value === true) {
        return [`--allow-${name}`];
      }
      if (typeof value === "undefined") {
        return [];
      }
      if (value.length > 0) {
        return value.map((singleValue) => `--allow-name='${singleValue}'`);
      }
      return [];
    },
  );
}
