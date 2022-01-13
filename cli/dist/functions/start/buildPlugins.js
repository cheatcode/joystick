import fs from "fs";
import chalk from "chalk";
import updateFileMap from "./updateFileMap.js";
import { JOYSTICK_UI_REGEX, EXPORT_DEFAULT_REGEX } from "../../lib/regexes.js";
import generateId from "./generateId.js";
var buildPlugins_default = {
  bootstrapLayoutComponent: {
    name: "bootstrapLayoutComponent",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        try {
          const shouldBootstrap = ["ui/layouts"].some((bootstrapTarget) => {
            return args.path.includes(bootstrapTarget);
          });
          if (shouldBootstrap) {
            const code = fs.readFileSync(args.path, "utf-8");
            const joystickUIMatches = code.match(JOYSTICK_UI_REGEX) || [];
            const joystickUIMatch = joystickUIMatches && joystickUIMatches[0];
            const exportDefaultMatches = code.match(EXPORT_DEFAULT_REGEX) || [];
            const exportDefaultMatch = exportDefaultMatches && exportDefaultMatches[0];
            if (joystickUIMatch && !exportDefaultMatch) {
              console.log(" ");
              console.warn(chalk.yellowBright(`All Joystick components in the ui/layouts directory must have an export default statement (e.g., export default MyLayout). Please check the file at ${args.path}.`));
              console.log(" ");
              return;
            }
            const matchParts = exportDefaultMatch && exportDefaultMatch.split(" ") || [];
            const componentName = matchParts.pop();
            if (componentName) {
              const code2 = fs.readFileSync(args.path, "utf-8");
              return {
                contents: code2.replace(`${exportDefaultMatch};`, `if (
                    typeof window !== 'undefined' &&
                    window.__joystick_ssr__ === true &&
                    window.__joystick_layout_page__ &&
                    ui &&
                    ui.mount
                  ) {
                    (async () => {
                      const layoutComponentFile = await import(window.__joystick_layout__);
                      const pageComponentFile = await import(window.window.__joystick_layout_page_url__);
                      const layout = layoutComponentFile.default;
                      const page = pageComponentFile.default;
                      ui.mount(layout, Object.assign({ ...window.__joystick_ssr_props__ }, { page }), document.getElementById('app'));
                    })();
                  }
                
                export default ${componentName};
                  `),
                loader: "js"
              };
            }
          }
        } catch (exception) {
          console.warn(exception);
        }
      });
    }
  },
  bootstrapPageComponent: {
    name: "bootstrapPageComponent",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        try {
          const shouldBootstrap = ["ui/pages"].some((bootstrapTarget) => {
            return args.path.includes(bootstrapTarget);
          });
          if (shouldBootstrap) {
            const code = fs.readFileSync(args.path, "utf-8");
            const joystickUIMatches = code.match(JOYSTICK_UI_REGEX) || [];
            const joystickUIMatch = joystickUIMatches && joystickUIMatches[0];
            const exportDefaultMatches = code.match(EXPORT_DEFAULT_REGEX) || [];
            const exportDefaultMatch = exportDefaultMatches && exportDefaultMatches[0];
            if (joystickUIMatch && !exportDefaultMatch) {
              console.log(" ");
              console.warn(chalk.yellowBright(`All Joystick components in the ui/pages directory must have an export default statement (e.g., export default MyPage). Please check the file at ${args.path}.`));
              console.log(" ");
              return;
            }
            const matchParts = exportDefaultMatch && exportDefaultMatch.split(" ") || [];
            const componentName = matchParts.pop();
            if (componentName) {
              const code2 = fs.readFileSync(args.path, "utf-8");
              return {
                contents: code2.replace(`${exportDefaultMatch};`, `if (
                    typeof window !== 'undefined' &&
                    window.__joystick_ssr__ === true &&
                    !window.__joystick_layout_page__ &&
                    ui &&
                    ui.mount
                  ) {
                    ui.mount(${componentName}, window.__joystick_ssr_props__ || {}, document.getElementById('app'));
                  }
                  
                  export default ${componentName};
                  `),
                loader: "js"
              };
            }
          }
        } catch (exception) {
          console.warn(exception);
        }
      });
    }
  },
  generateFileDependencyMap: {
    name: "generateFileDependencyMap",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        try {
          const canAddToMap = ![
            "node_modules",
            ".joystick",
            "?",
            "commonjsHelpers.js"
          ].some((excludedPath) => {
            return args.path.includes(excludedPath);
          });
          if (canAddToMap) {
            const code = fs.readFileSync(args.path, "utf-8");
            updateFileMap(args.path, code);
          }
        } catch (exception) {
          console.warn(exception);
        }
      });
    }
  },
  ssrId: {
    name: "ssrId",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        const shouldSetId = ["ui/"].some((bootstrapTarget) => {
          return args.path.includes(bootstrapTarget);
        });
        if (shouldSetId) {
          const code = fs.readFileSync(args.path, "utf-8");
          return {
            contents: code.replace(`{x|ssrId|x}`, generateId()),
            loader: "js"
          };
        }
      });
    }
  }
};
export {
  buildPlugins_default as default
};
