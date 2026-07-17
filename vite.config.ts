// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { execSync } from "node:child_process";

function safeExec(cmd: string, fallback: string) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return fallback;
  }
}

const BUILD_COMMIT = (
  process.env.VITE_BUILD_COMMIT ??
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.COMMIT_SHA ??
  safeExec("git rev-parse --short HEAD", "dev")
).slice(0, 7);

const BUILD_TIME = new Date().toISOString();
const mcpPlugins = process.platform === "win32" ? [] : [mcpPlugin()];

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // @lovable.dev/mcp-js currently compares Vite's slash-normalized root
    // with Windows-native resolved paths and aborts during configResolved.
    // The generated MCP routes are committed, so Windows can safely skip
    // regeneration while Linux CI and Lovable builds retain the plugin.
    plugins: mcpPlugins,
    define: {
      __BUILD_COMMIT__: JSON.stringify(BUILD_COMMIT),
      __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    },
  },
});
