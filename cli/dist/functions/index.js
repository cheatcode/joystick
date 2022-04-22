import create from "./create/index.js";
import start from "./start/index.js";
import build from "./build/index.js";
import update from "./update/index.js";
import deploy from "./deploy/index.js";
import deployment from "./deployment/index.js";
const [_node, _bin, ...rawArgs] = process.argv;
var functions_default = {
  build: {
    set: !!rawArgs.includes("build"),
    description: "Build an existing Joystick app.",
    args: {},
    options: {
      type: {
        flags: {
          "-t": {
            set: !!rawArgs.includes("-t"),
            value: !!rawArgs.includes("-t") && rawArgs[rawArgs.indexOf("-t") + 1]
          },
          "--type": {
            set: !!rawArgs.includes("--type"),
            value: !!rawArgs.includes("--type") && rawArgs[rawArgs.indexOf("--type") + 1]
          }
        },
        description: "The type of build you want to generate (tar or folder)."
      },
      outputPath: {
        flags: {
          "-o": {
            set: !!rawArgs.includes("-o"),
            value: !!rawArgs.includes("-o") && rawArgs[rawArgs.indexOf("-o") + 1]
          },
          "--outputPath": {
            set: !!rawArgs.includes("--outputPath"),
            value: !!rawArgs.includes("--outputPath") && rawArgs[rawArgs.indexOf("--outputPath") + 1]
          }
        },
        description: "The path you want to build the output to."
      }
    },
    function: build
  },
  create: {
    set: !!rawArgs.includes("create"),
    description: "Create a new Joystick app.",
    args: {
      name: {
        set: !!rawArgs.includes("create") && !!rawArgs[rawArgs.indexOf("create") + 1],
        value: !!rawArgs.includes("create") && rawArgs[rawArgs.indexOf("create") + 1],
        description: "The name of the app to create."
      }
    },
    options: {},
    function: create
  },
  deploy: {
    set: !!rawArgs.includes("deploy"),
    description: "Deploy an existing Joystick app.",
    args: {},
    options: {
      domain: {
        flags: {
          "-d": {
            set: !!rawArgs.includes("-d"),
            value: !!rawArgs.includes("-d") && rawArgs[rawArgs.indexOf("-d") + 1]
          },
          "--domain": {
            set: !!rawArgs.includes("--domain"),
            value: !!rawArgs.includes("--domain") && rawArgs[rawArgs.indexOf("--domain") + 1]
          }
        },
        description: "The domain name you want to deploy your app to."
      },
      environment: {
        flags: {
          "-e": {
            set: !!rawArgs.includes("-e"),
            value: !!rawArgs.includes("-e") && rawArgs[rawArgs.indexOf("-e") + 1]
          },
          "--environment": {
            set: !!rawArgs.includes("--environment"),
            value: !!rawArgs.includes("--environment") && rawArgs[rawArgs.indexOf("--environment") + 1]
          }
        },
        description: "The value you want to use for NODE_ENV in the deployed app (e.g., staging or production). Default is production."
      },
      token: {
        flags: {
          "-t": {
            set: !!rawArgs.includes("-t"),
            value: !!rawArgs.includes("-t") && rawArgs[rawArgs.indexOf("-t") + 1]
          },
          "--token": {
            set: !!rawArgs.includes("--token"),
            value: !!rawArgs.includes("--token") && rawArgs[rawArgs.indexOf("--token") + 1]
          }
        },
        description: "A deployment token from the cheatcode.co/u/deployments/tokens page."
      }
    },
    function: deploy
  },
  deployment: {
    set: !!rawArgs.includes("deployment"),
    description: "View and manage an existing deployment.",
    args: {
      action: {
        set: !!rawArgs.includes("deployment") && !!rawArgs[rawArgs.indexOf("deployment") + 1],
        value: !!rawArgs.includes("deployment") && rawArgs[rawArgs.indexOf("deployment") + 1],
        description: "The action to perform for the deployment."
      }
    },
    options: {
      domain: {
        flags: {
          "-d": {
            set: !!rawArgs.includes("-d"),
            value: !!rawArgs.includes("-d") && rawArgs[rawArgs.indexOf("-d") + 1]
          },
          "--domain": {
            set: !!rawArgs.includes("--domain"),
            value: !!rawArgs.includes("--domain") && rawArgs[rawArgs.indexOf("--domain") + 1]
          }
        },
        description: "The domain name for the deployment you want to view or manage."
      },
      token: {
        flags: {
          "-t": {
            set: !!rawArgs.includes("-t"),
            value: !!rawArgs.includes("-t") && rawArgs[rawArgs.indexOf("-t") + 1]
          },
          "--token": {
            set: !!rawArgs.includes("--token"),
            value: !!rawArgs.includes("--token") && rawArgs[rawArgs.indexOf("--token") + 1]
          }
        },
        description: "A deployment token from the cheatcode.co/u/deployments/tokens page."
      }
    },
    function: deployment
  },
  start: {
    set: !!rawArgs.includes("start"),
    description: "Start an existing Joystick app.",
    args: {},
    options: {
      environment: {
        flags: {
          "-e": {
            set: !!rawArgs.includes("-e"),
            value: !!rawArgs.includes("-e") && rawArgs[rawArgs.indexOf("-e") + 1]
          },
          "--environment": {
            set: !!rawArgs.includes("--environment"),
            value: !!rawArgs.includes("--environment") && rawArgs[rawArgs.indexOf("--environment") + 1]
          }
        },
        description: "Environment to set for process.env.NODE_ENV."
      },
      logs: {
        flags: {
          "-l": {
            set: !!rawArgs.includes("-l"),
            value: !!rawArgs.includes("-l") && rawArgs[rawArgs.indexOf("-l") + 1]
          },
          "--logs": {
            set: !!rawArgs.includes("--logs"),
            value: !!rawArgs.includes("--logs") && rawArgs[rawArgs.indexOf("--logs") + 1]
          }
        },
        description: "Path for storing logs."
      },
      port: {
        flags: {
          "-p": {
            set: !!rawArgs.includes("-p"),
            value: !!rawArgs.includes("-p") && parseInt(rawArgs[rawArgs.indexOf("-p") + 1], 10)
          },
          "--port": {
            set: !!rawArgs.includes("--port"),
            value: !!rawArgs.includes("--port") && parseInt(rawArgs[rawArgs.indexOf("--port") + 1], 10)
          }
        },
        description: "Port number to run the app on."
      }
    },
    function: start
  },
  update: {
    set: !!rawArgs.includes("update"),
    description: "Update all Joystick packages to their latest version.",
    args: {},
    options: {},
    function: update
  }
};
export {
  functions_default as default
};
