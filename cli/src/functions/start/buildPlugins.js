import fs from "fs";
import chalk from "chalk";
import uglify from "uglify-js";
import updateFileMap from "./updateFileMap.js";
import {
  JOYSTICK_UI_REGEX,
  EXPORT_DEFAULT_REGEX,
  JOYSTICK_COMPONENT_REGEX,
  JOYSTICK_COMMENT_REGEX,
} from "../../lib/regexes.js";
import generateId from "./generateId.js";
import getPlatformSafePath from "../../lib/getPlatformSafePath.js";
import setComponentId from "./setComponentId.js";

export default {
  bootstrapComponent: {
    name: "bootstrapComponent",
    setup(build) {
      // NOTE: Generate SSR ID and then replace the necessary markup. Make contents a let so we can perform
      // additional modifications below.
      const ssrId = generateId();

      build.onLoad({ filter: /\.js$/ }, (args = {}) => {
        try {
          const shouldSetSSRId = [getPlatformSafePath("ui/")].some(
            (bootstrapTarget) => {
              return args.path.includes(bootstrapTarget);
            }
          );
          const isLayoutComponent = [getPlatformSafePath("ui/layouts")].some(
            (bootstrapTarget) => {
              return args.path.includes(bootstrapTarget);
            }
          );
          const isPageComponent = [getPlatformSafePath("ui/pages")].some(
            (bootstrapTarget) => {
              return args.path.includes(bootstrapTarget);
            }
          );
          const isEmailComponent = [getPlatformSafePath("email/")].some(
            (bootstrapTarget) => {
              return args.path.includes(bootstrapTarget);
            }
          );

          if (
            shouldSetSSRId ||
            isLayoutComponent ||
            isPageComponent ||
            isEmailComponent
          ) {
            const code = fs.readFileSync(
              getPlatformSafePath(args.path),
              "utf-8"
            );

            // NOTE: Check to see if we have a valid component file.
            const joystickUIMatches = code.match(JOYSTICK_UI_REGEX) || [];
            const joystickUIMatch = joystickUIMatches && joystickUIMatches[0];
            const exportDefaultMatches = code.match(EXPORT_DEFAULT_REGEX) || [];
            const exportDefaultMatch =
              exportDefaultMatches && exportDefaultMatches[0];

            if (joystickUIMatch && !exportDefaultMatch) {
              console.log(" ");
              console.warn(
                chalk.yellowBright(
                  `All Joystick components in the ui directory must have an export default statement (e.g., export default MyComponent, export default MyLayout, or export default MyPage). Please check the file at ${args.path}.`
                )
              );
              console.log(" ");
              return;
            }

            // TODO:
            let contents = code.replace(
              "ui.component({",
              `ui.component({\n  _ssrId: '${ssrId}',`
            );

            // NOTE: Remove any commented code inside of render() so it doesn't get rendered during SSR
            // or in the browser.
            contents = contents.replace(JOYSTICK_COMMENT_REGEX, "");

            const exportDefaultMatchParts =
              (exportDefaultMatch && exportDefaultMatch.split(" ")) || [];
            const componentName = exportDefaultMatchParts.pop();

            if (componentName && isLayoutComponent) {
              contents = contents.replace(
                `${exportDefaultMatch};`,
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
              );
            }

            if (componentName && isPageComponent) {
              contents = contents.replace(
                `${exportDefaultMatch};`,
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
              );
            }

            return {
              contents,
              loader: "js",
            };
          }
        } catch (exception) {
          console.warn(exception);
        }
      });

      build.onEnd(() => {
        return new Promise((resolve) => {
          const shouldSetComponentId = [
            getPlatformSafePath("ui/"),
            getPlatformSafePath("email/"),
          ].some((bootstrapTarget) => {
            return build.initialOptions.outfile.includes(bootstrapTarget);
          });

          if (shouldSetComponentId) {
            const file = fs.readFileSync(build.initialOptions.outfile, "utf-8");
            const joystickUIMatches =
              file?.match(JOYSTICK_COMPONENT_REGEX) || [];

            if (joystickUIMatches?.length > 0) {
              let contents = setComponentId(file)?.replace(
                /\.component\(\/\*\*\//g,
                ".component("
              );
              fs.writeFileSync(build.initialOptions.outfile, contents);
            }
          }

          resolve();
        });
      });
    },
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
            "commonjsHelpers.js",
          ].some((excludedPath) => {
            return getPlatformSafePath(args.path).includes(excludedPath);
          });

          if (canAddToMap) {
            const code = fs.readFileSync(
              getPlatformSafePath(args.path),
              "utf-8"
            );
            updateFileMap(getPlatformSafePath(args.path), code);
          }
        } catch (exception) {
          console.warn(exception);
        }
      });
    },
  },
  minify: {
    name: "minify",
    setup(build) {
      build.onEnd(() => {
        const file = fs.readFileSync(build.initialOptions.outfile, "utf-8");
        const minified = uglify.minify(file);

        if (minified.error) {
          console.warn(minified.error);
        }

        if (!minified.error) {
          fs.writeFileSync(build.initialOptions.outfile, minified.code);
        }
      });
    },
  },
  warnNodeEnvironment: {
    name: "warnNodeEnvironment",
    setup(build) {
      build.onLoad({ filter: /\.js$/ }, (args = {}) => {
        const code = fs.readFileSync(args.path, "utf-8");

        if (code?.match(/process.env.NODE_ENV\s+=\s/gi)?.length) {
          console.warn(
            chalk.yellowBright(
              "\n[WARNING] process.env.NODE_ENV should only be set via a CLI flag in development or via external environment variables in production.\n"
            )
          );
        }
      });
    },
  },
};
