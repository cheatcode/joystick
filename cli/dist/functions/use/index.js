import replaceInFiles from "replace-in-files";
import child_process from "child_process";
var use_default = async (args = {}) => {
  if (args?.version === "canary") {
    await replaceInFiles({
      files: ["./index.server.js", "./api/**/*.js", "lib/node/**/*.js"],
      from: /(@joystick.js\/node)(?!-)/g,
      to: "@joystick.js/node-canary",
      optionsForFiles: {
        // default
        "ignore": [
          "**/node_modules/**"
        ]
      }
    });
    await replaceInFiles({
      files: ["./index.client.js", "./ui/**/*.js", "lib/**/*.js"],
      from: /(@joystick.js\/ui)(?!-)/g,
      to: "@joystick.js/ui-canary",
      optionsForFiles: {
        // default
        "ignore": [
          "**/node_modules/**"
        ]
      }
    });
    console.log("\nSwapping production packages for canary versions...\n");
    child_process.execSync("npm uninstall @joystick.js/node && npm i @joystick.js/node-canary");
    child_process.execSync("npm uninstall @joystick.js/ui && npm i @joystick.js/ui-canary");
  }
  if (args?.version === "production") {
    await replaceInFiles({
      files: ["./index.server.js", "./api/**/*.js", "lib/node/**/*.js"],
      from: /(@joystick.js\/node-canary)/g,
      to: "@joystick.js/node",
      optionsForFiles: {
        // default
        "ignore": [
          "**/node_modules/**"
        ]
      }
    });
    await replaceInFiles({
      files: ["./index.client.js", "./ui/**/*.js", "lib/**/*.js"],
      from: /(@joystick.js\/ui-canary)/g,
      to: "@joystick.js/ui",
      optionsForFiles: {
        // default
        "ignore": [
          "**/node_modules/**"
        ]
      }
    });
    console.log("\nSwapping canary packages for production versions...\n");
    child_process.execSync("npm uninstall @joystick.js/node-canary && npm i @joystick.js/node");
    child_process.execSync("npm uninstall @joystick.js/ui-canary && npm i @joystick.js/ui");
  }
};
export {
  use_default as default
};
