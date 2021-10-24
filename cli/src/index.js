#!/usr/bin/env node --no-warnings

import cli from "commander";
import create from "./functions/create/index.js";
import build from "./functions/build/index.js";
import start from "./functions/start/index.js";

cli.description("Create and manage Joystick apps.");
cli.usage("command");
cli.addHelpCommand(false);
cli.helpOption(
  "-h, --help",
  "Learn how to use this command line interface (CLI)."
);

cli
  .command("create <projectName>")
  .description("Create a new Joystick app.")
  .action(create);

cli
  .command("build")
  .description("Build an existing Joystick app.")
  .action(build);

cli
  .command("start")
  .description("Start an existing Joystick app.")
  .option("-p, --port <port>", "Run Joystick on a custom port.")
  .option(
    "-e, --environment <environment>",
    "Set the process.env.NODE_ENV for Joystick."
  )
  .action(start);

cli.parse(process.argv);
