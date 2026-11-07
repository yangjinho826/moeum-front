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
  // tsconfig 는 Next 용 jsx: "preserve" — 테스트에선 React 17+ 자동 런타임으로 변환(컴포넌트 테스트에 React import 불필요)
  esbuild: { jsx: "automatic" },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
