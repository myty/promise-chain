import { build, emptyDir } from "https://deno.land/x/dnt@0.30.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: "dev",
  },
  package: {
    name: "composable-promise",
    version: Deno.args[0].substring("refs/tags/v".length),
    description:
      "Wrapper utility class that enables composition via asynchronous (Promises) and synchronous method chaining.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/myty/composable-promise.git",
    },
    bugs: {
      url: "https://github.com/myty/composable-promise/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
