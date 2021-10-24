import node from "@joystick.js/node";
import fs from "fs";
import getCSSFromTree from "./getCSSFromTree";
import formatCSS from "./formatCSS";

export default ({
  Component,
  props = {},
  path = "",
  url = {},
  translations = {},
  layout = null,
}) => {
  try {
    const component = Component(props, url, translations);

    // NOTE: Value passed to renderToHTML() is the initial ssrTree, which is a component
    // tree purpose-built for SSR to aid in extraction of CSS and other component info.
    const tree = {
      id: component.id,
      instance: component,
      children: [],
    };

    const baseHTML = fs.readFileSync(`${process.cwd()}/index.html`, "utf-8");
    const html = component.renderToHTML(tree, translations);
    const css = formatCSS(getCSSFromTree(tree));

    return baseHTML
      .replace("${meta}", "")
      .replace("${css}", css)
      .replace("${scripts}", "")
      .replace(
        '<div id="app"></div>',
        `
        <div id="app">${html.wrapped}</div>
        <script>
          window.__joystick_ssr__ = true;
          window.__joystick_ssr_props__ = ${JSON.stringify(props)};
          window.__joystick_i18n__ = ${JSON.stringify(translations)};
          window.__joystick_settings__ = ${JSON.stringify({
            global: node?.default?.settings?.global,
            public: node?.default?.settings?.public,
          })};
          
          window.__joystick_url__ = ${JSON.stringify(url)};

          window.__joystick_layout__ = ${
            layout ? `"/_joystick/${layout}"` : null
          };

          window.__joystick_layout_page_url__ = ${
            layout ? `"/_joystick/${path}"` : null
          };

          window.__joystick_layout_page__ = ${
            layout ? `"${path.split(".")[0]}"` : null
          };
        </script>
        <script src="/_joystick/utils/process.js"></script>
        <script src="/_joystick/index.client.js"></script>
        ${path ? `<script src="/_joystick/${path}"></script>` : ""}
        ${layout ? `<script src="/_joystick/${layout}"></script>` : ""}
        <script src="/_joystick/hmr/client.js"></script>
        `
      );
  } catch (exception) {
    console.warn(exception);
  }
};
