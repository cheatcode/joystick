import chalk from "chalk";
import { EXPORT_DEFAULT_REGEX } from "../../lib/regexes.js";
var bootstrapPageComponent_default = () => {
  return {
    transform(code, id) {
      const shouldBootstrap = ["pages"].some((bootstrapTarget) => {
        return id.includes(bootstrapTarget);
      });
      if (shouldBootstrap) {
        const matches = code.match(EXPORT_DEFAULT_REGEX) || [];
        const match = matches && matches[0];
        if (!match) {
          console.log(" ");
          console.warn(
            chalk.yellowBright(
              `All components in the ui/pages directory must have an export default statement (e.g., export default MyPage). Please check the file at ${id}.`
            )
          );
          console.log(" ");
          return null;
        }
        const matchParts = match && match.split(" ") || [];
        const componentName = matchParts.pop();
        if (componentName) {
          return {
            code: code.replace(
              `${match};`,
              `            
            if (
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
            )
          };
        }
      }
      return null;
    }
  };
};
export {
  bootstrapPageComponent_default as default
};
