// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.30.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    name: "composable-async",
    version: Deno.args[0],
    description:
      "Wrapper utility class that enables composition via asynchronous (Promises) and synchronous method chaining.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/myty/composable-async.git",
    },
    bugs: {
      url: "https://github.com/myty/composable-async/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
