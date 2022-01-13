import fs from "fs";
import getCSSFromTree from "../ssr/getCSSFromTree";
import formatCSS from "../ssr/formatCSS";

const defaultBaseHTMLPath = process.env.NODE_ENV === 'test' ? `${process.cwd()}/src/email/templates/base.html` : `${process.cwd()}/node_modules/@joystick.js/node/dist/email/templates/base.html`;
const defaultBaseHTML = fs.readFileSync(defaultBaseHTMLPath, "utf-8");

export default ({ Component, props = {} }) => {
  try {
    const component = Component({ props });

    // NOTE: Value passed to renderToHTML() is the initial ssrTree, which is a component
    // tree purpose-built for SSR to aid in extraction of CSS and other component info.
    const tree = {
      id: component.id,
      instance: component,
      children: [],
    };

    const customBaseHTML = fs.existsSync(`${process.cwd()}/email/base.html`)
      ? fs.readFileSync(`${process.cwd()}/email/base.html`, "utf-8")
      : null;
    const html = component.renderToHTML(tree);
    const css = formatCSS(getCSSFromTree(tree));

    return (customBaseHTML || defaultBaseHTML)
      .replace("${css}", css)
      .replace(
        '<div id="email"></div>',
        `<div id="email">${html.wrapped}</div>`
      );
  } catch (exception) {
    console.warn(exception);
  }
};
