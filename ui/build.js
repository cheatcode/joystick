import esbuild from "esbuild";

esbuild.build({
  entryPoints: [`src/index.js`],
  bundle: true,
  outfile: `./dist/index.js`,
  platform: "browser",
  target: "es2024",
  format: "esm",
  minify: true,
  plugins: [],
  external: [],
})
.catch((error) => {
  console.log(error);
});
