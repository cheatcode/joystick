import build from "./build/index.js";
import create from "./create/index.js";
import logout from "./logout/index.js";
import push from "./push/index.js";
import start from "./start/index.js";
import update from "./update/index.js";
import use from "./use/index.js";
import test from "./test/index.js";
const [_node, _bin, ...rawArgs] = process.argv;
var functions_default = {
  build: {
    set: !!rawArgs.includes("build"),
    description: "Build an existing Joystick app.",
    args: {},
    options: {
      environment: {
        flags: {
          "-e": {
            set: !!rawArgs.includes("-e"),
            value: !!rawArgs.includes("-e") && rawArgs[rawArgs.indexOf("-e") + 1],
            parent: "build"
          },
          "--environment": {
            set: !!rawArgs.includes("--environment"),
            value: !!rawArgs.includes("--environment") && rawArgs[rawArgs.indexOf("--environment") + 1],
            parent: "build"
          }
        },
        description: "The NODE_ENV you want to use for your build (default: production)."
      },
      outputPath: {
        flags: {
          "-o": {
            set: !!rawArgs.includes("-o"),
            value: !!rawArgs.includes("-o") && rawArgs[rawArgs.indexOf("-o") + 1],
            parent: "build"
          },
          "--outputPath": {
            set: !!rawArgs.includes("--outputPath"),
            value: !!rawArgs.includes("--outputPath") && rawArgs[rawArgs.indexOf("--outputPath") + 1],
            parent: "build"
          }
        },
        description: "The path you want to build the output to."
      },
      type: {
        flags: {
          "-t": {
            set: !!rawArgs.includes("-t"),
            value: !!rawArgs.includes("-t") && rawArgs[rawArgs.indexOf("-t") + 1],
            parent: "build"
          },
          "--type": {
            set: !!rawArgs.includes("--type"),
            value: !!rawArgs.includes("--type") && rawArgs[rawArgs.indexOf("--type") + 1],
            parent: "build"
          }
        },
        description: "The type of build you want to generate (tar or folder)."
      },
      continuousIntegration: {
        flags: {
          "-ci": {
            set: !!rawArgs.includes("-ci"),
            value: !!rawArgs.includes("-ci"),
            parent: "build"
          },
          "--continuousIntegration": {
            set: !!rawArgs.includes("--continuousIntegration"),
            value: !!rawArgs.includes("--continuousIntegration"),
            parent: "build"
          }
        },
        description: "Is this build being run in a continuous integration environment?"
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
        parent: "create",
        value: !!rawArgs.includes("create") && rawArgs[rawArgs.indexOf("create") + 1],
        description: "The name of the app to create."
      }
    },
    options: {},
    function: create
  },
  logout: {
    set: !!rawArgs.includes("logout"),
    description: "Log out of your CheatCode account.",
    args: {},
    options: {},
    function: logout
  },
  push: {
    set: !!rawArgs.includes("push"),
    description: "Deploy your Joystick app using Push.",
    args: {},
    options: {
      domain: {
        flags: {
          "-d": {
            set: !!rawArgs.includes("-d"),
            value: !!rawArgs.includes("-d") && rawArgs[rawArgs.indexOf("-d") + 1],
            parent: "push"
          },
          "--domain": {
            set: !!rawArgs.includes("--domain"),
            value: !!rawArgs.includes("--domain") && rawArgs[rawArgs.indexOf("--domain") + 1],
            parent: "push"
          }
        },
        description: "The domain name where your app will be accessible."
      },
      environment: {
        flags: {
          "-e": {
            set: !!rawArgs.includes("-e"),
            value: !!rawArgs.includes("-e") && rawArgs[rawArgs.indexOf("-e") + 1],
            parent: "push"
          },
          "--environment": {
            set: !!rawArgs.includes("--environment"),
            value: !!rawArgs.includes("--environment") && rawArgs[rawArgs.indexOf("--environment") + 1],
            parent: "push"
          }
        },
        description: "The value you want to use for NODE_ENV in the deployed app (e.g., staging or production). Default is production."
      },
      provision_server: {
        flags: {
          "-p": {
            set: !!rawArgs.includes("-p"),
            value: !!rawArgs.includes("-p") && rawArgs[rawArgs.indexOf("-p") + 1],
            parent: "push"
          },
          "--provision-server": {
            set: !!rawArgs.includes("--provision-server"),
            value: !!rawArgs.includes("--provision-server") && rawArgs[rawArgs.indexOf("--provision-server") + 1],
            parent: "push"
          }
        },
        description: 'The Push provision server to target (either "development" or "production").'
      }
    },
    function: push
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
            value: !!rawArgs.includes("-e") && rawArgs[rawArgs.indexOf("-e") + 1],
            parent: "start"
          },
          "--environment": {
            set: !!rawArgs.includes("--environment"),
            value: !!rawArgs.includes("--environment") && rawArgs[rawArgs.indexOf("--environment") + 1],
            parent: "start"
          }
        },
        description: "Environment to set for process.env.NODE_ENV."
      },
      logs: {
        flags: {
          "-l": {
            set: !!rawArgs.includes("-l"),
            value: !!rawArgs.includes("-l") && rawArgs[rawArgs.indexOf("-l") + 1],
            parent: "start"
          },
          "--logs": {
            set: !!rawArgs.includes("--logs"),
            value: !!rawArgs.includes("--logs") && rawArgs[rawArgs.indexOf("--logs") + 1],
            parent: "start"
          }
        },
        description: "Path for storing logs."
      },
      port: {
        flags: {
          "-p": {
            set: !!rawArgs.includes("-p"),
            value: !!rawArgs.includes("-p") && parseInt(rawArgs[rawArgs.indexOf("-p") + 1], 10),
            parent: "start"
          },
          "--port": {
            set: !!rawArgs.includes("--port"),
            value: !!rawArgs.includes("--port") && parseInt(rawArgs[rawArgs.indexOf("--port") + 1], 10),
            parent: "start"
          }
        },
        description: "Port number to run the app on."
      },
      debug: {
        flags: {
          "-d": {
            set: !!rawArgs.includes("-d"),
            value: !!rawArgs.includes("-d"),
            parent: "start"
          },
          "--debug": {
            set: !!rawArgs.includes("--debug"),
            value: !!rawArgs.includes("--debug"),
            parent: "start"
          }
        },
        description: "Run the Joystick app's Node.js process in debug mode with --inspect."
      }
    },
    function: start
  },
  test: {
    set: !!rawArgs.includes("test"),
    description: "Start an existing Joystick app and run its tests.",
    args: {
      watch: {
        set: !!rawArgs.includes("watch"),
        parent: "test",
        value: !!rawArgs.includes("watch"),
        description: "Run joystick test in watch mode."
      }
    },
    options: {
      watch: {
        flags: {
          "--watch": {
            set: !!rawArgs.includes("--watch"),
            value: !!rawArgs.includes("--watch"),
            parent: "test"
          }
        },
        description: "Environment to set for process.env.NODE_ENV."
      }
    },
    function: test
  },
  update: {
    set: !!rawArgs.includes("update"),
    description: "Update all Joystick packages to their latest version.",
    args: {},
    options: {},
    function: update
  },
  use: {
    set: !!rawArgs.includes("use"),
    description: "Decides which version of Joystick to use (production or canary).",
    args: {
      version: {
        set: !!rawArgs.includes("use") && !!rawArgs[rawArgs.indexOf("use") + 1],
        parent: "use",
        value: !!rawArgs.includes("use") && rawArgs[rawArgs.indexOf("use") + 1],
        description: "The version of Joystick to use."
      }
    },
    options: {},
    function: use
  }
};
export {
  functions_default as default
};
