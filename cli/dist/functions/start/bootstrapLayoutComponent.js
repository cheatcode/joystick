import chalk from "chalk";
import { EXPORT_DEFAULT_REGEX } from "../../lib/regexes.js";
var bootstrapLayoutComponent_default = () => {
  return {
    transform(code, id) {
      const shouldBootstrap = ["layouts"].some((bootstrapTarget) => {
        return id.includes(bootstrapTarget);
      });
      if (shouldBootstrap) {
        const matches = code.match(EXPORT_DEFAULT_REGEX) || [];
        const match = matches && matches[0];
        if (!match) {
          console.log(" ");
          console.warn(
            chalk.yellowBright(
              `All components in the ui/layouts directory must have an export default statement (e.g., export default MyLayout). Please check the file at ${id}.`
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
              `if (
                typeof window !== 'undefined' &&
                window.__joystick_ssr__ === true &&
                window.__joystick_layout_page__ &&
                ui &&
                ui.mount
              ) {
                fetch(window.__joystick_layout_page_url__).then(async (response) => {
                  const file = await response.text();
                  const component = eval(file);
                  ui.mount(${componentName}, Object.assign({ ...window.__joystick_ssr_props__ }, { page: window[window.__joystick_layout_page__].js }), document.getElementById('app'));
                });
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
  bootstrapLayoutComponent_default as default
};
