import fs from "fs";
import updateFileMap from "./updateFileMap.js";
import { EXPORT_DEFAULT_REGEX } from "../../lib/regexes.js";

export default {
  bootstrapLayoutComponent: {
    name: "bootstrapLayoutComponent",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        const shouldBootstrap = ["ui/layouts"].some((bootstrapTarget) => {
          return args.path.includes(bootstrapTarget);
        });

        if (shouldBootstrap) {
          const code = fs.readFileSync(args.path, "utf-8");
          const matches = code.match(EXPORT_DEFAULT_REGEX) || [];
          const match = matches && matches[0];

          if (!match) {
            console.log(" ");
            console.warn(
              chalk.yellowBright(
                `All components in the ui/layouts directory must have an export default statement (e.g., export default MyLayout). Please check the file at ${args.path}.`
              )
            );
            console.log(" ");
            return;
          }

          const matchParts = (match && match.split(" ")) || [];
          const componentName = matchParts.pop();

          if (componentName) {
            const code = fs.readFileSync(args.path, "utf-8");

            return {
              contents: code.replace(
                `${match};`,
                `if (
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
                `
              ),
              loader: "js",
            };
          }
        }
      });
    },
  },
  bootstrapPageComponent: {
    name: "bootstrapPageComponent",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        const shouldBootstrap = ["ui/pages"].some((bootstrapTarget) => {
          return args.path.includes(bootstrapTarget);
        });

        if (shouldBootstrap) {
          const code = fs.readFileSync(args.path, "utf-8");
          const matches = code.match(EXPORT_DEFAULT_REGEX) || [];
          const match = matches && matches[0];

          if (!match) {
            console.log(" ");
            console.warn(
              chalk.yellowBright(
                `All components in the ui/pages directory must have an export default statement (e.g., export default MyLayout). Please check the file at ${args.path}.`
              )
            );
            console.log(" ");
            return;
          }

          const matchParts = (match && match.split(" ")) || [];
          const componentName = matchParts.pop();

          if (componentName) {
            const code = fs.readFileSync(args.path, "utf-8");

            return {
              contents: code.replace(
                `${match};`,
                `if (
                  typeof window !== 'undefined' &&
                  window.__joystick_ssr__ === true &&
                  !window.__joystick_layout_page__ &&
                  ui &&
                  ui.mount
                ) {
                  ui.mount(${componentName}, window.__joystick_ssr_props__ || {}, document.getElementById('app'));
                }
                
                export default ${componentName};
                `
              ),
              loader: "js",
            };
          }
        }
      });
    },
  },
  generateFileDependencyMap: {
    name: "generateFileDependencyMap",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args) => {
        const canAddToMap = ![
          "node_modules",
          ".joystick",
          "?",
          "commonjsHelpers.js",
        ].some((excludedPath) => {
          return args.path.includes(excludedPath);
        });

        if (canAddToMap) {
          const code = fs.readFileSync(args.path, "utf-8");
          updateFileMap(args.path, code);
        }
      });
    },
  },
};
