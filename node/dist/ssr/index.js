import fs from "fs";
import getCSSFromTree from "./getCSSFromTree";
import formatCSS from "./formatCSS";
import setHeadTagsInHTML from "./setHeadTagsInHTML";
var ssr_default = ({
  Component,
  props = {},
  path = "",
  url = {},
  translations = {},
  layout = null,
  head = null
}) => {
  try {
    const component = Component(props, url, translations);
    const tree = {
      id: component.id,
      instance: component,
      children: []
    };
    const baseHTML = fs.readFileSync(`${process.cwd()}/index.html`, "utf-8");
    const html = component.renderToHTML(tree, translations);
    const css = formatCSS(getCSSFromTree(tree));
    const baseHTMLWithReplacements = baseHTML.replace("${meta}", "").replace("${css}", css).replace("${scripts}", "").replace('<div id="app"></div>', `
        <div id="app">${html.wrapped}</div>
        <script>
          window.__joystick_ssr__ = true;
          window.__joystick_ssr_props__ = ${JSON.stringify(props)};
          window.__joystick_i18n__ = ${JSON.stringify(translations)};
          window.__joystick_settings__ = ${JSON.stringify({
      global: joystick?.settings?.global,
      public: joystick?.settings?.public
    })};
          
          window.__joystick_url__ = ${JSON.stringify(url)};

          window.__joystick_layout__ = ${layout ? `"/_joystick/${layout}"` : null};

          window.__joystick_layout_page_url__ = ${layout ? `"/_joystick/${path}"` : null};

          window.__joystick_layout_page__ = ${layout ? `"${path.split(".")[0]}"` : null};
        <\/script>
        <script type="module" src="/_joystick/utils/process.js"><\/script>
        <script type="module" src="/_joystick/index.client.js"><\/script>
        ${path ? `<script type="module" src="/_joystick/${path}"><\/script>` : ""}
        ${layout ? `<script type="module" src="/_joystick/${layout}"><\/script>` : ""}
        <script type="module" src="/_joystick/hmr/client.js"><\/script>
        `);
    if (head) {
      return setHeadTagsInHTML(baseHTMLWithReplacements, head);
    }
    return baseHTMLWithReplacements;
  } catch (exception) {
    console.warn(exception);
  }
};
export {
  ssr_default as default
};
