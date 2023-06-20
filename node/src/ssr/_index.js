import fs from "fs";
import getCSSFromTree from "./getCSSFromTree";
import formatCSS from "./formatCSS";
import setHeadTagsInHTML from "./setHeadTagsInHTML";
import get from '../api/get';
import set from '../api/set';
import getBrowserSafeRequest from "../app/getBrowserSafeRequest";
import replaceWhenTags from "./replaceWhenTags";

export default async ({
  Component,
  props = {},
  path = "",
  url = {},
  translations = {},
  layout = null,
  head = null,
  req = {},
}) => {
  try {
    // NOTE: We have to relay the original SSR req object because if/when these get
    // and set functions are called on the server, they have no awareness of the original
    // inbound request (it's technically a brand new request). Passing the cookie here
    // ensures that the user making the request is "forwarded" along with those requests.
    const api = {
      get: (getterName = '', getterOptions = {}) => {
        return get(getterName, {
          ...getterOptions,
          headers: {
            cookie: req?.headers?.cookie,
          },
        });
      },
      set: (setterName = '', setterOptions = {}) => {
        return set(setterName, {
          ...setterOptions,
          headers: {
            cookie: req?.headers?.cookie,
          },
        });
      },
    };


    const browserSafeRequest = getBrowserSafeRequest({ ...req });
    const component = Component({
      props,
      url,
      translations,
      api,
      req: browserSafeRequest,
    });

    // NOTE: Value passed to renderToHTML() is the initial ssrTree, which is a component
    // tree purpose-built for SSR to aid in extraction of CSS and other component info.
    const tree = {
      id: component.id,
      instanceId: component.instanceId,
      instance: component,
      children: [],
      dataFunctions: [],
    };

    const dataFromParentComponent = await component.handleFetchData(api, browserSafeRequest);
    const baseHTML = fs.readFileSync(`${process.cwd()}/index.html`, "utf-8");

    // NOTE: Do a first-pass to collect data from the tree and store in tree.dataFunctions array.
    component.renderToHTML({
      ssrTree: tree,
      translations,
      walkingTreeForSSR: true,
      dataFromSSR: [],
    });
    
    // NOTE: Take all of the found data functions and call them to get their data.
    const dataFromTree = await Promise.all(tree.dataFunctions.map(async (dataFunction) => {
      return dataFunction();
    }));

    // NOTE: Map the data functions into an object we can pass to the client via window.__joystick_data__
    // global below.
    const dataForClient = dataFromTree.reduce((data = {}, dataFromChildComponent) => {
      if (!data[dataFromChildComponent.ssrId]) {
        data[dataFromChildComponent.ssrId] = dataFromChildComponent.data;
      }

      return data;
    }, {});

    // NOTE: Perform actual render of HTML for the SSR, passing in fetched data.
    const html = component.renderToHTML({
      ssrTree: tree,
      translations,
      walkingTreeForSSR: false,
      dataFromSSR: dataFromTree,
    });
    const htmlWithoutWhenTags = replaceWhenTags(html.wrapped);

    const css = formatCSS(getCSSFromTree(tree));

    const baseHTMLWithReplacements = baseHTML
      .replace("${meta}", "")
      .replace("${css}", css)
      .replace("${scripts}", "")
      .replace(
        '<div id="app"></div>',
        `
        <div id="app">${htmlWithoutWhenTags}</div>
        <script>
          window.__joystick_ssr__ = true;
          window.__joystick_data__ = ${
            JSON.stringify({
              [component.ssrId]: dataFromParentComponent || {},
              ...(dataForClient || {}),
            })
          };
          window.__joystick_req__ = ${JSON.stringify(browserSafeRequest)};
          window.__joystick_ssr_props__ = ${JSON.stringify(props)};
          window.__joystick_i18n__ = ${JSON.stringify(translations)};
          window.__joystick_settings__ = ${JSON.stringify({
            global: joystick?.settings?.global,
            public: joystick?.settings?.public,
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
        <script type="module" src="/_joystick/utils/process.js"></script>
        <script type="module" src="/_joystick/index.client.js"></script>
        ${
          path ? `<script type="module" src="/_joystick/${path}"></script>` : ""
        }
        ${
          layout
            ? `<script type="module" src="/_joystick/${layout}"></script>`
            : ""
        }
        ${process.env.NODE_ENV === 'development' ? `window.__joystick__hmr_port = ${parseInt(process.env.PORT, 10) + 1}` : ''}
        ${process.env.NODE_ENV === 'development' ? `<script type="module" src="/_joystick/hmr/client.js"></script>` : ''}
        `
      );

    if (head) {
      return setHeadTagsInHTML(baseHTMLWithReplacements, head);
    }

    return baseHTMLWithReplacements;
  } catch (exception) {
    console.warn(exception);
  }
};
