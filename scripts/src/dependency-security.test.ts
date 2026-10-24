import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import test from "node:test";

// Resolve through real consumers, not a separate test-only copy of the package.
const webRequire = createRequire(
  new URL("../../artifacts/chavrutai/package.json", import.meta.url),
);
const tailwindRequire = createRequire(webRequire.resolve("tailwindcss"));
const micromatchRequire = createRequire(tailwindRequire.resolve("micromatch"));
const chokidarRequire = createRequire(tailwindRequire.resolve("chokidar"));
const globRequire = createRequire(tailwindRequire.resolve("fast-glob"));
const globMatchRequire = createRequire(globRequire.resolve("micromatch"));
const bracesPath = micromatchRequire.resolve("braces");
const braces = micromatchRequire("braces");

test("all brace-pattern consumers resolve the security-patched dependency", () => {
  assert.equal(chokidarRequire.resolve("braces"), bracesPath);
  assert.equal(globMatchRequire.resolve("braces"), bracesPath);
  assert.throws(() => braces.parse("{".repeat(500)), {
    name: "SyntaxError",
    message: /maximum nesting depth/,
  });
});

test("ordinary brace compilation, expansion and escaped literals remain compatible", () => {
  assert.deepEqual(braces("src/{pages,components}/*.{ts,tsx}"), [
    "src/(pages|components)/*.(ts|tsx)",
  ]);
  assert.deepEqual(braces.expand("file-{1..3}.{ts,tsx}"), [
    "file-1.ts", "file-1.tsx", "file-2.ts", "file-2.tsx", "file-3.ts", "file-3.tsx",
  ]);
  const pattern = "src/{pages,{components,lib}}/*.tsx";
  assert.equal(braces.stringify(braces.parse(pattern)), pattern);
  assert.deepEqual(braces.expand("\\{literal\\}"), ["{literal}"]);
  // Literal braces inside quotes or character classes do not add AST depth.
  assert.doesNotThrow(() => braces.parse('"' + "{".repeat(500) + '"'));
  assert.doesNotThrow(() => braces.parse("[" + "{".repeat(500) + "]"));
});

test("deep patterns and caller-provided ASTs fail safely instead of overflowing the stack", () => {
  // A subprocess timeout also catches hangs or process termination. Run with a
  // smaller stack than production so a missed recursive entry point is visible.
  const result = spawnSync(process.execPath, ["--stack-size=512", "-e", `
    const assert = require("node:assert/strict");
    const braces = require(${JSON.stringify(bracesPath)});
    const safeError = { name: "SyntaxError", message: /maximum nesting depth/ };
    for (const method of ["parse", "create", "compile", "expand", "stringify"]) {
      for (const [open, close] of [["{", "}"], ["(", ")"]]) {
        // Stay below braces' existing 10,000-character cap: that length cap
        // alone does not prevent the reported stack overflow.
        const prefix = open.repeat(3000);
        for (const pattern of [prefix, prefix + "a,b" + close.repeat(3000)]) {
          assert.throws(() => braces[method](pattern, {
            maxDepth: Infinity, maxLength: Infinity, rangeLimit: false
          }), safeError);
        }
      }
    }
    let ast = { type: "text", value: "x" };
    for (let i = 0; i < 20000; i++) ast = { type: "root", nodes: [ast] };
    for (const method of ["compile", "expand", "stringify"]) {
      assert.throws(() => braces[method](ast), safeError);
    }
    const cyclic = { type: "root", nodes: [] };
    cyclic.nodes.push(cyclic);
    for (const method of ["compile", "expand", "stringify"]) {
      assert.throws(() => braces[method](cyclic), safeError);
    }
  `], { timeout: 5000, encoding: "utf8" });
  assert.ifError(result.error);
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr);
});
