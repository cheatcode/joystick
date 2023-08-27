/* eslint-disable consistent-return */

import fs from "fs";
import joystick, { __package } from "../index.js";
import get from "../api/get";
import set from "../api/set";
import getBrowserSafeRequest from "../app/getBrowserSafeRequest";
import formatCSS from "./formatCSS";
import getCSSFromTree from "./getCSSFromTree";
import replaceWhenTags from "./replaceWhenTags";
import setHeadTagsInHTML from "./setHeadTagsInHTML";
import { parseHTML } from "linkedom";
import getDataFromComponent from "./getDataFromComponent.js";
import getAPIForDataFunctions from "./getAPIForDataFunctions.js";
import getBrowserSafeUser from "../app/accounts/getBrowserSafeUser.js";

const injectCSSIntoHTML = (html, baseCSS = "", css = "") => {
  try {
    return html
      .replace("${css}", css)
      .replace("${globalCSS}", `<style>${baseCSS || ""}</style>`)
      .replace("${componentCSS}", css);
  } catch (exception) {
    throw new Error(`[ssr.injectCSSIntoHTML] ${exception.message}`);
  }
};

const handleHTMLReplacementsForApp = ({
  baseHTML = "",
  // css = '',
  componentHTML = "",
  componentInstance = {},
  dataFromComponent,
  dataForClient = {},
  browserSafeUser = {},
  browserSafeRequest = {},
  props = {},
  translations = {},
  url = {},
  layoutComponentPath = "",
  pageComponentPath = "",
}) => {
  try {
    return baseHTML
      .replace("${meta}", "")
      .replace("${scripts}", "")
      .replace(
        '<div id="app"></div>',
        `
        <div id="app">${componentHTML}</div>
        <script>
          window.joystick = {};
          
          if (window.joystick) {
            window.joystick.settings = {
              global: ${JSON.stringify(joystick?.settings?.global)},
              public: ${JSON.stringify(joystick?.settings?.public)},
            };
          }

          window.__joystick_ssr__ = true;
          ${
            process.env.NODE_ENV === "development"
              ? `window.__joystick_hmr_port__ = ${
                  parseInt(process.env.PORT, 10) + 1
                };`
              : ""
          }
          window.__joystick_data__ = ${JSON.stringify({
            [componentInstance.id]: dataFromComponent?.data || {},
            ...(dataForClient || {}),
          })};
          window.__joystick_user__ = ${JSON.stringify(browserSafeUser)};
          window.__joystick_req__ = ${JSON.stringify(browserSafeRequest)};
          window.__joystick_ssr_props__ = ${JSON.stringify(props)};
          window.__joystick_i18n__ = ${JSON.stringify(translations)};
          window.__joystick_settings__ = ${JSON.stringify({
            global: joystick?.settings?.global,
            public: joystick?.settings?.public,
          })};
          window.__joystick_url__ = ${JSON.stringify(url)};
          window.__joystick_layout__ = ${
            layoutComponentPath ? `"/_joystick/${layoutComponentPath}"` : null
          };
          window.__joystick_layout_page_url__ = ${
            layoutComponentPath ? `"/_joystick/${pageComponentPath}"` : null
          };
          window.__joystick_layout_page__ = ${
            layoutComponentPath ? `"${pageComponentPath.split(".")[0]}"` : null
          };
        </script>
        <script type="module" src="/_joystick/utils/process.js"></script>
        <script type="module" src="/_joystick/index.client.js"></script>
        ${
          pageComponentPath
            ? `<script type="module" src="/_joystick/${pageComponentPath}"></script>`
            : ""
        }
        ${
          layoutComponentPath
            ? `<script type="module" src="/_joystick/${layoutComponentPath}"></script>`
            : ""
        }
        ${
          process.env.NODE_ENV === "development"
            ? `<script type="module" src="/_joystick/hmr/client.js"></script>`
            : ""
        }
        `
      );
  } catch (exception) {
    throw new Error(`[ssr.handleHTMLReplacementsForApp] ${exception.message}`);
  }
};

const handleHTMLReplacementsForEmail = ({
  subject = "",
  preheader = "",
  baseHTML = "",
  componentHTML = "",
}) => {
  try {
    return baseHTML
      .replace("${subject}", subject)
      .replace("${preheader}", preheader || "")
      .replace('<div id="email"></div>', componentHTML);
  } catch (exception) {
    throw new Error(
      `[ssr.handleHTMLReplacementsForEmail] ${exception.message}`
    );
  }
};

const getHTMLWithTargetReplacements = ({
  componentInstance = {},
  componentHTML = "",
  isEmailRender = false,
  emailSubject = "",
  emailPreheader = "",
  baseHTML = "",
  dataFromComponent = {},
  dataForClient = {},
  browserSafeUser = {},
  browserSafeRequest = {},
  props = {},
  translations = {},
  url = {},
  layoutComponentPath = "",
  pageComponentPath = "",
}) => {
  try {
    if (isEmailRender) {
      return handleHTMLReplacementsForEmail({
        subject: emailSubject,
        preheader: emailPreheader,
        baseHTML,
        componentHTML: componentHTML,
      });
    }

    return handleHTMLReplacementsForApp({
      componentInstance,
      baseHTML,
      componentHTML,
      dataFromComponent,
      dataForClient,
      browserSafeUser,
      browserSafeRequest,
      props,
      translations,
      url,
      layoutComponentPath,
      pageComponentPath,
    });
  } catch (exception) {
    throw new Error(`[ssr.getHTMLWithTargetReplacements] ${exception.message}`);
  }
};

const getHTMLWithData = (
  renderingHTMLWithDataForSSR = false,
  componentInstance = {},
  ssrTree = {},
  translations = {},
  dataFromComponent = {},
  dataFromTree = []
) => {
  try {
    return componentInstance.renderToHTML({
      ssrTree,
      translations,
      walkingTreeForSSR: false,
      renderingHTMLWithDataForSSR,
      dataFromSSR: [dataFromComponent, ...dataFromTree],
    });
  } catch (exception) {
    throw new Error(`[ssr.getHTMLWithData] ${exception.message}`);
  }
};

const processHTML = ({
  componentInstance = {},
  ssrTree = {},
  dataFromComponent = {},
  dataFromTree = [],
  dataForClient = {},
  baseHTML = "",
  isEmailRender = false,
  emailSubject = "",
  emailPreheader = "",
  browserSafeUser = {},
  browserSafeRequest = {},
  props = {},
  translations = {},
  url = {},
  layoutComponentPath = "",
  pageComponentPath = "",
  head = null,
  renderingHTMLWithDataForSSR = false,
  req,
}) => {
  try {
    const htmlWithData = getHTMLWithData(
      renderingHTMLWithDataForSSR,
      componentInstance,
      ssrTree,
      translations,
      dataFromComponent,
      dataFromTree
    );

    const htmlWithWhenReplacements = replaceWhenTags(htmlWithData.wrapped);

    const htmlWithTargetReplacements = getHTMLWithTargetReplacements({
      componentInstance,
      componentHTML: htmlWithWhenReplacements,
      isEmailRender,
      emailSubject,
      emailPreheader,
      baseHTML,
      dataFromComponent,
      dataFromTree,
      dataForClient,
      browserSafeUser,
      browserSafeRequest,
      props,
      translations,
      url,
      layoutComponentPath,
      pageComponentPath,
    });

    // NOTE: If no head is available, setHeadTagsInHTML will return htmlWithTargetReplacements
    // without any changes.
    return setHeadTagsInHTML(htmlWithTargetReplacements, head, req);
  } catch (exception) {
    throw new Error(`[ssr.processHTML] ${exception.message}`);
  }
};

const getBaseCSS = (baseHTMLName = "") => {
  try {
    // NOTE: Passed value is baseHTMLName, however, we want to replace .html with .css to check for a CSS file.
    const customBaseCSSPathForEmail = baseHTMLName
      ? `${process.cwd()}/email/base_${baseHTMLName}.css`
      : null;
    const customDefaultBaseCSSPathForEmail = `${process.cwd()}/email/base.css`;
    const defaultBaseCSSPathForEmail =
      process.env.NODE_ENV === "test"
        ? `${process.cwd()}/src/email/templates/base.css`
        : `${__package}/email/templates/base.css`;

    // NOTE: Default if none of the other conditionals below catch.
    let baseCSSPathToFetch = defaultBaseCSSPathForEmail;

    if (fs.existsSync(customDefaultBaseCSSPathForEmail)) {
      baseCSSPathToFetch = customDefaultBaseCSSPathForEmail;
    }

    if (fs.existsSync(customBaseCSSPathForEmail)) {
      baseCSSPathToFetch = customBaseCSSPathForEmail;
    }

    return fs.existsSync(baseCSSPathToFetch)
      ? fs.readFileSync(baseCSSPathToFetch, "utf-8")
      : "";
  } catch (exception) {
    throw new Error(`[ssr.getBaseCSS] ${exception.message}`);
  }
};

const addAttributesToDOM = (dom = {}, attributes = {}) => {
  try {
    const attributeKeys = Object.keys(attributes);
    const attributeKeysWithoutClassList = attributeKeys?.filter(
      (key) => key !== "class"
    );

    if (Array.isArray(attributes?.class?.list)) {
      if (attributes?.class?.method === "replace") {
        dom.setAttribute("class", attributes.class.list.join(" "));
      } else {
        let currentItem = attributes.class.list.length;

        while (currentItem--) {
          const className = attributes.class.list[currentItem];
          dom.classList.add(className);
        }
      }
    }

    let currentAttribute = attributeKeysWithoutClassList.length;

    while (currentAttribute--) {
      const attribute = attributes.class.list[currentAttribute];
      dom.setAttribute(attribute, attributes[attribute]);
    }

    return dom;
  } catch (exception) {
    throw new Error(`[ssr.addAttributesToDOM] ${exception.message}`);
  }
};

const addAttributesToBaseHTML = (baseHTML = "", attributes = {}) => {
  try {
    const { document } = parseHTML(baseHTML);

    if (attributes?.html) {
      addAttributesToDOM(document.documentElement, attributes.html);
    }

    if (attributes?.body) {
      addAttributesToDOM(document.body, attributes.body);
    }

    return document.toString();
  } catch (exception) {
    throw new Error(`[ssr.addAttributesToBaseHTML] ${exception.message}`);
  }
};

const getBaseHTML = (isEmailRender = false, baseEmailHTMLName = "") => {
  try {
    let baseHTMLPathToFetch = `${process.cwd()}/index.html`;

    if (isEmailRender) {
      const customBaseHTMLPathForEmail = baseEmailHTMLName
        ? `${process.cwd()}/email/base_${baseEmailHTMLName}.html`
        : null;
      const customDefaultBaseHTMLPathForEmail = `${process.cwd()}/email/base.html`;
      const defaultBaseHTMLPathForEmail =
        process.env.NODE_ENV === "test"
          ? `${process.cwd()}/src/email/templates/base.html`
          : `${__package}/email/templates/base.html`;

      // NOTE: Default if none of the other conditionals below catch.
      baseHTMLPathToFetch = defaultBaseHTMLPathForEmail;

      if (fs.existsSync(customDefaultBaseHTMLPathForEmail)) {
        baseHTMLPathToFetch = customDefaultBaseHTMLPathForEmail;
      }

      if (fs.existsSync(customBaseHTMLPathForEmail)) {
        baseHTMLPathToFetch = customBaseHTMLPathForEmail;
      }
    }

    return fs.existsSync(baseHTMLPathToFetch)
      ? fs.readFileSync(baseHTMLPathToFetch, "utf-8")
      : "";
  } catch (exception) {
    throw new Error(`[ssr.getBaseHTML] ${exception.message}`);
  }
};

const buildDataForClient = (dataFromTree = []) => {
  try {
    return dataFromTree.reduce((data = {}, dataFromChildComponent) => {
      if (!data[dataFromChildComponent.componentId]) {
        data[dataFromChildComponent.componentId] = dataFromChildComponent.data || JSON.parse(dataFromChildComponent.error);
      }

      return data;
    }, {});
  } catch (exception) {
    throw new Error(`[ssr.buildDataForClient] ${exception.message}`);
  }
};

const getDataFromTree = (ssrTree = {}) => {
  try {
    return Promise.all(
      ssrTree.dataFunctions.map(async (dataFunction) => {
        return dataFunction();
      })
    );
  } catch (exception) {
    throw new Error(`[ssr.getDataFromTree] ${exception.message}`);
  }
};

const buildTreeForComponent = (
  componentInstance = {},
  ssrTree = {},
  translations = {}
) => {
  try {
    // NOTE: Running renderToHTML with walkingTreeForSSR skips return of HTML and allows us to
    // "scoop up" all of the child components and their data functions into ssrTree.
    componentInstance.renderToHTML({
      ssrTree,
      translations,
      walkingTreeForSSR: true,
      dataFromSSR: [],
    });
  } catch (exception) {
    throw new Error(`[ssr.buildTreeForComponent] ${exception.message}`);
  }
};

const getTreeForSSR = (componentInstance = {}) => {
  try {
    return {
      id: componentInstance.id,
      instanceId: componentInstance.instanceId,
      instance: componentInstance,
      children: [],
      dataFunctions: [],
    };
  } catch (exception) {
    throw new Error(`[ssr.getTreeForSSR] ${exception.message}`);
  }
};

const getComponentInstance = (Component, options = {}) => {
  try {
    return Component(options);
  } catch (exception) {
    throw new Error(`[ssr.getComponentInstance] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error("options object is required.");
    if (!options.componentFunction)
      throw new Error("options.componentFunction is required.");
  } catch (exception) {
    throw new Error(`[ssr.validateOptions] ${exception.message}`);
  }
};

const ssr = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const apiForDataFunctions = getAPIForDataFunctions(options.req, options?.api);
    const browserSafeUser = getBrowserSafeUser(options?.req?.context?.user);
    const browserSafeRequest = options?.email
      ? {}
      : getBrowserSafeRequest({ ...(options?.req || {}) });

    const componentInstance = getComponentInstance(options.componentFunction, {
      props: options?.props || {},
      url: options?.url || {},
      translations: options?.translations || {},
      api: apiForDataFunctions,
      req: browserSafeRequest,
    });

    componentInstance.user = browserSafeUser;

    const ssrTree = getTreeForSSR(componentInstance);
    const ssrTreeForCSS = getTreeForSSR(componentInstance);
    const dataFromComponent = await getDataFromComponent(
      componentInstance,
      apiForDataFunctions,
      browserSafeUser,
      browserSafeRequest
    ).then((data) => data).catch((error) => {
      return [{ error }];
    });

    buildTreeForComponent(componentInstance, ssrTree, options?.translations);
    buildTreeForComponent(componentInstance, ssrTreeForCSS, options?.translations);

    const dataFromTree = await getDataFromTree(ssrTree).then((data) => data).catch((error) => {
      return [{ error }];
    });

    const dataForClient = !options?.email
      ? buildDataForClient(dataFromTree)
      : null;

    let baseHTML = getBaseHTML(options?.email, options?.baseEmailHTMLName);

    if (options?.attributes?.html || options?.attributes?.body) {
      baseHTML = addAttributesToBaseHTML(baseHTML, options?.attributes);
    }

    // NOTE: This is the HTML for the actual server-side render. Below, we run processHTML
    // again w/o a return value so that we can get a separate tree for capturing all CSS.

    const html = processHTML({
      renderingHTMLWithDataForSSR: false,
      componentInstance,
      ssrTree,
      dataFromComponent,
      dataFromTree,
      dataForClient,
      baseHTML,
      isEmailRender: options?.email,
      emailSubject: options?.emailSubject,
      emailPreheader: options?.emailPreheader,
      browserSafeUser,
      browserSafeRequest,
      props: options?.props,
      translations: options?.translations,
      url: options?.url,
      layoutComponentPath: options?.layoutComponentPath,
      pageComponentPath: options?.pageComponentPath,
      head: options?.head,
      req: options?.req,
    });

    // NOTE: We do this again so we can scoop all possible CSS (including conditional CSS via when tags).
    // The actual HTML returned for the SSR is captured above. Note the usage of ssrTreeForCSS vs ssrTree
    // here which separates the two "runs" of processHTML.

    processHTML({
      renderingHTMLWithDataForSSR: true,
      componentInstance,
      ssrTree: ssrTreeForCSS,
      dataFromComponent,
      dataFromTree,
      dataForClient,
      baseHTML,
      isEmailRender: options?.email,
      emailSubject: options?.emailSubject,
      emailPreheader: options?.emailPreheader,
      browserSafeUser,
      browserSafeRequest,
      props: options?.props,
      translations: options?.translations,
      url: options?.url,
      layoutComponentPath: options?.layoutComponentPath,
      pageComponentPath: options?.pageComponentPath,
      head: options?.head,
    });

    const baseCSS = options?.email
      ? getBaseCSS(options?.baseEmailHTMLName)
      : "";
    const css = formatCSS(getCSSFromTree(ssrTreeForCSS));
    const htmlWithCSS = injectCSSIntoHTML(html, baseCSS, css);

    resolve(htmlWithCSS);
  } catch (exception) {
    reject(`[ssr] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    ssr(options, { resolve, reject });
  });
