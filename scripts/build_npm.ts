import { build, emptyDir } from "https://deno.land/x/dnt@0.30.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: "dev",
  },
  package: {
    name: "@myty/promise-chain",
    version: Deno.args[0].substring("refs/tags/v".length),
    description:
      "Wrapper utility class that enables composition via asynchronous (Promises) and synchronous method chaining.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/myty/promise-chain.git",
    },
    bugs: {
      url: "https://github.com/myty/promise-chain/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
