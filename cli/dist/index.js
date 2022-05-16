#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const args = process.argv.slice(2, process.argv.length);
spawn("node", ["--no-warnings", `${__dirname}/cli.js`, ...args], { stdio: "inherit" });
