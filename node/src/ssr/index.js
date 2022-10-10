/* eslint-disable consistent-return */

import fs from 'fs';
import joystick from '@joystick.js/node';
import get from '../api/get';
import set from '../api/set';
import getBrowserSafeRequest from "../app/getBrowserSafeRequest";
import formatCSS from "./formatCSS";
import getCSSFromTree from "./getCSSFromTree";
import replaceWhenTags from "./replaceWhenTags";
import setHeadTagsInHTML from "./setHeadTagsInHTML";
import { parseHTML } from 'linkedom';

const injectCSSIntoHTML = (html, baseCSS = '', css = '') => {
  try {
    return html
      .replace("${css}", css)
      .replace('${globalCSS}', `<style>${baseCSS || ''}</style>`)
      .replace('${componentCSS}', css);
  } catch (exception) {
    throw new Error(`[ssr.injectCSSIntoHTML] ${exception.message}`);
  }
};

const handleHTMLReplacementsForApp = ({
  baseHTML = '',
  // css = '',
  componentHTML = '',
  componentInstance = {},
  dataFromComponent,
  dataForClient = {},
  browserSafeRequest = {},
  props = {},
  translations = {},
  url = {},
  layoutComponentPath = '',
  pageComponentPath = '',
}) => {
  try {
    return baseHTML
      .replace("${meta}", "")
      // .replace("${css}", css)
      .replace("${scripts}", "")
      .replace(
        '<div id="app"></div>',
        `
        <div id="app">${componentHTML}</div>
        <script>
          window.__joystick_ssr__ = true;
          window.__joystick_data__ = ${
            JSON.stringify({
              // TODO:
              [componentInstance.id]: dataFromComponent || {},
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
          pageComponentPath ? `<script type="module" src="/_joystick/${pageComponentPath}"></script>` : ""
        }
        ${
          layoutComponentPath
            ? `<script type="module" src="/_joystick/${layoutComponentPath}"></script>`
            : ""
        }
        ${process.env.NODE_ENV === 'development' ? `<script type="module" src="/_joystick/hmr/client.js"></script>` : ''}
        `
      );
  } catch (exception) {
    throw new Error(`[ssr.handleHTMLReplacementsForApp] ${exception.message}`);
  }
};

const handleHTMLReplacementsForEmail = ({
  subject = '',
  preheader = '',
  baseHTML = '',
  // baseCSS = '',
  // componentCSS = '',
  componentHTML = '',
}) => {
  try {
    return baseHTML
      .replace('${subject}', subject)
      // .replace('${globalCSS}', `<style>${baseCSS || ''}</style>`)
      // .replace('${componentCSS}', componentCSS)
      .replace('${preheader}', preheader || '')
      .replace('<div id="email"></div>', componentHTML);
  } catch (exception) {
    throw new Error(`[ssr.handleHTMLReplacementsForEmail] ${exception.message}`);
  }
};

const getHTMLWithTargetReplacements = ({
  componentInstance = {},
  componentHTML = '',
  isEmailRender = false,
  emailSubject = '',
  emailPreheader = '',
  baseHTML = '',
  // baseCSS = '',
  // css = '',
  dataFromComponent = {},
  dataForClient = {},
  browserSafeRequest = {},
  props = {},
  translations = {},
  url = {},
  layoutComponentPath = '',
  pageComponentPath = '',
}) => {
  try {
    if (isEmailRender) {
      return handleHTMLReplacementsForEmail({
        subject: emailSubject,
        preheader: emailPreheader,
        baseHTML,
        // baseCSS,
        // componentCSS: css,
        componentHTML: componentHTML,
      });
    }

    return handleHTMLReplacementsForApp({
      componentInstance,
      baseHTML,
      // css,
      componentHTML,
      dataFromComponent,
      dataForClient,
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
  componentInstance = {},
  ssrTree = {},
  translations = {},
  dataFromComponent = {},
  dataFromTree = [],
) => {
  try {
    return componentInstance.renderToHTML({
      ssrTree,
      translations,
      walkingTreeForSSR: false,
      renderingHTMLWithDataForSSR: true,
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
  baseHTML = '',
  // baseCSS = '',
  // css = '',
  isEmailRender = false,
  emailSubject = '',
  emailPreheader = '',
  browserSafeRequest = {},
  props = {},
  translations = {},
  url = {},
  layoutComponentPath = '',
  pageComponentPath = '',
  head = null,
}) => {
  try {
    const htmlWithData = getHTMLWithData(
      componentInstance,
      ssrTree,
      translations,
      dataFromComponent,
      dataFromTree,
    );

    const htmlWithWhenReplacements = replaceWhenTags(htmlWithData.wrapped);

    const htmlWithTargetReplacements = getHTMLWithTargetReplacements({
      componentInstance,
      componentHTML: htmlWithWhenReplacements,
      isEmailRender,
      emailSubject,
      emailPreheader,
      baseHTML,
      // baseCSS,
      // css,
      dataFromComponent,
      dataFromTree,
      dataForClient,
      browserSafeRequest,
      props,
      translations,
      url,
      layoutComponentPath,
      pageComponentPath,
    });

    // NOTE: If no head is available, setHeadTagsInHTML will return htmlWithTargetReplacements
    // without any changes.
    return setHeadTagsInHTML(htmlWithTargetReplacements, head);
  } catch (exception) {
    throw new Error(`[ssr.processHTML] ${exception.message}`);
  }
};

const getBaseCSS = (baseHTMLName = '') => {
  try {
    // NOTE: Passed value is baseHTMLName, however, we want to replace .html with .css to check for a CSS file.
    const customBaseCSSPathForEmail = baseHTMLName ? `${process.cwd()}/email/base_${baseHTMLName}.css` : null;
    const customDefaultBaseCSSPathForEmail = `${process.cwd()}/email/base.css`;
    const defaultBaseCSSPathForEmail = process.env.NODE_ENV === 'test' ?
    `${process.cwd()}/src/email/templates/base.css` :
    `${process.cwd()}/node_modules/@joystick.js/node/dist/email/templates/base.css`;
    
    // NOTE: Default if none of the other conditionals below catch.
    let baseCSSPathToFetch = defaultBaseCSSPathForEmail;
  
    if (fs.existsSync(customDefaultBaseCSSPathForEmail)) {
      baseCSSPathToFetch = customDefaultBaseCSSPathForEmail;
    }

    if (fs.existsSync(customBaseCSSPathForEmail)) {
      baseCSSPathToFetch = customBaseCSSPathForEmail;
    }

    return fs.existsSync(baseCSSPathToFetch) ? fs.readFileSync(baseCSSPathToFetch, 'utf-8') : '';
  } catch (exception) {
    throw new Error(`[ssr.getBaseCSS] ${exception.message}`);
  }
};

const addAttributesToDOM = (dom = {}, attributes = {}) => {
  try {
    const attributeKeys = Object.keys(attributes);
    const attributeKeysWithoutClassList = attributeKeys?.filter((key) => key !== 'class');

    if (Array.isArray(attributes?.class?.list)) {
      if (attributes?.class?.method === 'replace') {
        dom.setAttribute('class', attributes.class.list.join(' '));
      } else {
        attributes.class.list.forEach((className) => {
          dom.classList.add(className);
        });
      }
    }
    
    attributeKeysWithoutClassList.forEach((attribute) => {
      dom.setAttribute(attribute, attributes[attribute]);
    });

    return dom;
  } catch (exception) {
    throw new Error(`[ssr.addAttributesToDOM] ${exception.message}`);
  }
};

const addAttributesToBaseHTML = (baseHTML = '', attributes = {}) => {
  try {
    const { document } = parseHTML(baseHTML);
    
    if (attributes?.html) {
      addAttributesToDOM(document.documentElement, attributes.html)
    }

    if (attributes?.body) {
      addAttributesToDOM(document.body, attributes.body)
    }

    return document.toString();
  } catch (exception) {
    throw new Error(`[ssr.addAttributesToBaseHTML] ${exception.message}`);
  }
};

const getBaseHTML = (isEmailRender = false, baseEmailHTMLName = '') => {
  try {
    let baseHTMLPathToFetch = `${process.cwd()}/index.html`;

    if (isEmailRender) {
      const customBaseHTMLPathForEmail = baseEmailHTMLName ? `${process.cwd()}/email/base_${baseEmailHTMLName}.html` : null;
      const customDefaultBaseHTMLPathForEmail = `${process.cwd()}/email/base.html`;
      const defaultBaseHTMLPathForEmail = process.env.NODE_ENV === 'test' ?
      `${process.cwd()}/src/email/templates/base.html` :
      `${process.cwd()}/node_modules/@joystick.js/node/dist/email/templates/base.html`;

      // NOTE: Default if none of the other conditionals below catch.
      baseHTMLPathToFetch = defaultBaseHTMLPathForEmail;

      if (fs.existsSync(customDefaultBaseHTMLPathForEmail)) {
        baseHTMLPathToFetch = customDefaultBaseHTMLPathForEmail;
      }

      if (fs.existsSync(customBaseHTMLPathForEmail)) {
        baseHTMLPathToFetch = customBaseHTMLPathForEmail;
      }
    }

    return fs.existsSync(baseHTMLPathToFetch) ? fs.readFileSync(baseHTMLPathToFetch, 'utf-8') : '';
  } catch (exception) {
    throw new Error(`[ssr.getBaseHTML] ${exception.message}`);
  }
};

const buildDataForClient = (dataFromTree = []) => {
  try {
    return dataFromTree.reduce((data = {}, dataFromChildComponent) => {
      if (!data[dataFromChildComponent.componentId]) {
        data[dataFromChildComponent.componentId] = dataFromChildComponent.data;
      }

      return data;
    }, {});
  } catch (exception) {
    throw new Error(`[ssr.buildDataForClient] ${exception.message}`);
  }
};

const getDataFromTree = (ssrTree = {}) => {
  try {
    return Promise.all(ssrTree.dataFunctions.map(async (dataFunction) => {
      return dataFunction();
    }));
  } catch (exception) {
    throw new Error(`[ssr.getDataFromTree] ${exception.message}`);
  }
};

const buildTreeForComponent = (componentInstance = {}, ssrTree = {}, translations = {}) => {
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

const getDataFromComponent = (componentInstance = {}, api = {}, browserSafeRequest = {}) => {
  try {
    return componentInstance.handleFetchData(api, browserSafeRequest);
  } catch (exception) {
    throw new Error(`[ssr.getDataFromComponent] ${exception.message}`);
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

const getAPIForDataFunctions = (req = {}) => {
  try {
    // NOTE: We have to relay the original SSR req object because if/when these get
    // and set functions are called on the server, they have no awareness of the original
    // inbound request (it's technically a brand new request). Passing the cookie here
    // ensures that the user making the request is "forwarded" along with those requests.
    return {
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
  } catch (exception) {
    throw new Error(`[ssr.getAPIForDataFunctions] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.componentFunction) throw new Error('options.componentFunction is required.');
  } catch (exception) {
    throw new Error(`[ssr.validateOptions] ${exception.message}`);
  }
};

const ssr = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    const apiForDataFunctions = getAPIForDataFunctions(options.req);
    const browserSafeRequest = options?.email ? {} : getBrowserSafeRequest({ ...(options?.req || {}) });

    const componentInstance = getComponentInstance(options.componentFunction, {
      props: options?.props || {},
      url: options?.url || {},
      translations: options?.translations || {},
      api: apiForDataFunctions,
      req: browserSafeRequest,
    });

    const ssrTree = getTreeForSSR(componentInstance);
    const dataFromComponent = await getDataFromComponent(componentInstance, apiForDataFunctions, browserSafeRequest);

    buildTreeForComponent(componentInstance, ssrTree);

    const dataFromTree = await getDataFromTree(ssrTree);
    const dataForClient = !options?.email ? buildDataForClient(dataFromTree) : null;
    
    let baseHTML = getBaseHTML(options?.email, options?.baseEmailHTMLName);

    if (options?.attributes?.html || options?.attributes?.body) {
      baseHTML = addAttributesToBaseHTML(baseHTML, options?.attributes); 
    }

    const html = processHTML({
      componentInstance,
      ssrTree,
      dataFromComponent,
      dataFromTree,
      dataForClient,
      baseHTML,
      // baseCSS,
      // css,
      isEmailRender: options?.email,
      emailSubject: options?.emailSubject,
      emailPreheader: options?.emailPreheader,
      browserSafeRequest,
      props: options?.props,
      translations: options?.translations,
      url: options?.url,
      layoutComponentPath: options?.layoutComponentPath,
      pageComponentPath: options?.pageComponentPath,
      head: options?.head,
    });

    const baseCSS = options?.email ? getBaseCSS(options?.baseEmailHTMLName) : '';
    const css = formatCSS(getCSSFromTree(ssrTree));
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
