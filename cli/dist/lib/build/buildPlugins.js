import fs from "fs";
import chalk from "chalk";
import updateFileMap from "./updateFileMap.js";
import {
  JOYSTICK_UI_REGEX,
  EXPORT_DEFAULT_REGEX,
  JOYSTICK_COMPONENT_REGEX,
  JOYSTICK_COMMENT_REGEX,
  EXAMPLE_CODE_REGEX
} from "../regexes.js";
import generateId from "../generateId.js";
import getPlatformSafePath from "../getPlatformSafePath.js";
import setComponentId from "./setComponentId.js";
import replaceExamples from "./replaceExamples.js";
var buildPlugins_default = {
  bootstrapComponent: {
    name: "bootstrapComponent",
    setup(build) {
      const ssrId = generateId();
      build.onLoad({ filter: /\.js$/ }, (args = {}) => {
        try {
          const shouldSetComponentId = [getPlatformSafePath("ui/")].some(
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
          if (shouldSetComponentId || isLayoutComponent || isPageComponent || isEmailComponent) {
            const code = fs.readFileSync(
              getPlatformSafePath(args.path),
              "utf-8"
            );
            const joystickUIMatches = code.match(JOYSTICK_UI_REGEX) || [];
            const joystickUIMatch = joystickUIMatches && joystickUIMatches[0];
            const exportDefaultMatches = code.match(EXPORT_DEFAULT_REGEX) || [];
            const exportDefaultMatch = exportDefaultMatches && exportDefaultMatches[0];
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
            const examples = code.match(EXAMPLE_CODE_REGEX) || [];
            let contents = replaceExamples(code);
            contents = contents?.replace(
              /\.component\(\/\*\*\//g,
              ".component("
            );
            contents = contents.replace(JOYSTICK_COMMENT_REGEX, "");
            const exportDefaultMatchParts = exportDefaultMatch && exportDefaultMatch.split(" ") || [];
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
            for (let i = 0; i < examples?.length; i += 1) {
              const exampleToRestore = examples[i];
              contents = contents.replace(`%example:${i}%`, exampleToRestore);
            }
            return {
              contents,
              loader: "js"
            };
          }
        } catch (exception) {
          console.warn(exception);
        }
      });
      build.onEnd(() => {
        return new Promise((resolve) => {
          for (let i = 0; i < build?.initialOptions?.entryPoints?.length; i += 1) {
            const entryPoint = build?.initialOptions?.entryPoints[i];
            const shouldSetComponentId = [
              getPlatformSafePath("ui/"),
              getPlatformSafePath("email/")
            ].some((bootstrapTarget) => {
              return entryPoint.includes(bootstrapTarget);
            });
            if (shouldSetComponentId) {
              const file = fs.readFileSync(`${build?.initialOptions?.outdir}/${entryPoint}`, "utf-8");
              const joystickUIMatches = file?.match(JOYSTICK_COMPONENT_REGEX) || [];
              const examples = file.match(EXAMPLE_CODE_REGEX) || [];
              let contents = replaceExamples(file);
              if (joystickUIMatches?.length > 0) {
                contents = setComponentId(contents)?.replace(
                  /\.component\(\/\*\*\//g,
                  ".component("
                );
                for (let i2 = 0; i2 < examples?.length; i2 += 1) {
                  const exampleToRestore = examples[i2];
                  contents = contents.replace(`%example:${i2}%`, exampleToRestore);
                }
                fs.writeFileSync(`${build?.initialOptions?.outdir}/${entryPoint}`, contents);
              }
            }
          }
          resolve();
        });
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
    }
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
    }
  }
};
export {
  buildPlugins_default as default
};
