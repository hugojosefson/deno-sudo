# deno-sudo

`🦕 #`

Spawns a new `deno` process, using the system's `sudo` command to have that
spawned process gain privileged permissions.

The `sudo` executable will be connected to the console, so it can ask the user
for their password.

When the `sudo` process has achieved elevated privileges, the main original
`deno` process uses the `sudo deno` process to run any commands requiring `root`
privileges. It does this by communicating with that process, asking it to run
system commands on its behalf.

The benefit of keeping the privileged process around, and sending it commands to
run as `root`, is that it needs to ask the user only once for their password.
Even if long time passes between commands, which would otherwise time out the
`sudo` elevation and prompt the user to re-enter their password. This is useful
for e.g. scripting installation of operating systems and their components.

After initial instantiation, the API supplied is a single `import()` function,
which behaves much like the built-in dynamic `import()` statement. However,
instead of actually importing the module, it is imported in a separate
privileged `deno` process. The object returned to the caller is a `Proxy` which
delegates everything to the imported module in the privileged process.
