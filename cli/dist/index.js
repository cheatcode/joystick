#!/usr/bin/env node
import{spawn as r}from"child_process";import{fileURLToPath as o}from"url";import{dirname as n}from"path";const i=o(import.meta.url),e=n(i),s=process.argv.slice(2,process.argv.length);r("node",["--no-warnings",`${e}/cli.js`,...s],{stdio:"inherit"});
//# sourceMappingURL=index.js.map
