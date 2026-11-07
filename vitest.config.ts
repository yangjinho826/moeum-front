import { readFileSync } from "node:fs";
import path from "node:path";

import { defineConfig } from "vitest/config";

// tsconfig paths(`_features/*` → `./src/_features/*`)를 그대로 alias 로 — 두 곳을 따로 관리하면 어긋난다
const { compilerOptions } = JSON.parse(readFileSync("tsconfig.json", "utf8")) as {
  compilerOptions: { paths: Record<string, string[]> };
};
const alias = Object.fromEntries(
  Object.entries(compilerOptions.paths).map(([key, [target]]) => [
    key.replace(/\/\*$/, ""),
    path.resolve(__dirname, (target ?? "").replace(/\/\*$/, "")),
  ]),
);

export default defineConfig({
  resolve: { alias },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
