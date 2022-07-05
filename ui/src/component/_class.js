// import URLPattern from "url-pattern";
// import validateOptions from "./validateOptions";
// import serializeEvents from "../utils/serializeEvents";
// import addEventListener from "./class/events/addListener";
// import removeEventListeners from "./removeEventListeners";
// import buildVDOMTree from "./buildVDOMTree";
// import buildVDOM from "./buildVDOM";
// import render from "./render";
// import diffVirtualDOMNodes from "./diff/index.js";
// import renderFunctions from "./renderFunctions";
// import joystick from "../index";
// import { JOYSTICK_COMMENT_REGEX, NEWLINE_REGEX } from "./constants";
// import generateId from "../lib/generateId";
// import getRenderedDOMNode from './getRenderedDOMNode';
// import validateForm from "../validateForm";
// import get from '../api/get';
// import set from '../api/set';
// import getDataFromSSR from "./getDataFromSSR";
// import findComponentInTree from './findComponentInTree';
// import findComponentInTreeBySSRId from "./findComponentInTreeBySSRId";
// import { isObject } from "../validateForm/validators/types";
// import updateComponentInTree from "./class/updateComponentInTree";

// class Component {
//   constructor(options = {}) {
//     validateOptions(options);

//     this.ssrId = options._ssrId || null;
//     this.id = options.id || generateId(8);
//     this.dom = {
//       virtual: {},
//       actual: {},
//     };

//     this.options = options || {};
//     this.wrapper = options?.wrapper || {};
//     this.name = "";
//     this.defaultProps = options.defaultProps || {};
//     this.props = options.props || {};
//     this.state = {};
//     this.data = getDataFromSSR(options.dataFromSSR, options._ssrId) || {};
//     this.lifecycle = {
//       onBeforeMount: () => null,
//       onMount: () => null,
//       onBeforeUnmount: () => null,
//     };
//     this.methods = {};
//     this.events = {};
//     this.css = "";
//     this.children = [];
//     this.translations = options?.translations;
//     this.validateForm = validateForm;
  
//     this.handleSetProps();
//     this.handleAttachOptionsToInstance();

//     if (typeof window !== "undefined" && window.__joystick_data__ && window.__joystick_data__[this.ssrId]) {
//       const dataFromWindow = window.__joystick_data__[this.ssrId] || {};
//       const requestFromWindow = window.__joystick_req__ || {};
//       this.data = this.handleCompileData(dataFromWindow, requestFromWindow);
//     }

//     if (typeof window === "undefined") {
//       const url = options?.url || {};
//       this.url = {
//         ...url,
//         isActive: (path) => {
//           if (url.route !== '*') {
//             const pattern = new URLPattern(url.route);
//             return (url.path && url.path === path) || !!pattern.match(path);
//           }

//           return false;
//         },
//       };
//     }

//     if (typeof window !== "undefined" && window.__joystick_url__) {
//       const url = options?.url || {};
//       this.url = {
//         ...window.__joystick_url__,
//         isActive: (path) => {
//           if (url.route !== '*') {
//             const pattern = new URLPattern(window.__joystick_url__.route);
//             return (window.__joystick_url__.path && window.__joystick_url__.path === path) || !!pattern.match(path);
//           }

//           return false;
//         },
//       };
//     }
//   }

//   handleSetDOMNode() {
//     const DOMNode = getRenderedDOMNode(this.id);
//     this.DOMNode = DOMNode;
//   }

//   handleGetJoystickInstance() {
//     if (typeof window !== "undefined") {
//       return joystick && joystick.mountedInstance
//         ? joystick
//         : window.__joystick__;
//     }

//     return joystick;
//   }

//   handleGetComponentInstance() {
//     // NOTE: Allows us to get the latest copy of the component instance dynamically.
//     // This ensures any event listeners, methods, etc. have the latest copy at call time.
//     return this;
//   }

//   handleCompileData(data = {}, requestFromWindow = {}) {
//     return {
//       ...data,
//       refetch: async (input = {}) => {
//         const data = await this.handleFetchData({ get, set }, requestFromWindow, input);
//         // NOTE: Keep data on window up to date so if a parent re-renders a child that's refetched it's data since
//         // mount, the data rendered isn't stale.
//         window.__joystick_data__[this.ssrId] = data;
//         this.queueRender();
//         return data;
//       },
//     };
//   }

//   async handleFetchData(api = {}, req = {}, input = {}) {
//     if (this.options.data && typeof this.options.data === 'function') {
//       const data = await this.options.data(api, req, input);
//       this.data = this.handleCompileData(data, req);
//       return this.data;
//     }

//     return Promise.resolve();
//   }

//   handleCompileProps() {
//     // NOTE: Combine this.props and this.defaultProps key names and filter to uniques only.
//     const props = [...Object.keys(this.props || {}), ...Object.keys(this.defaultProps || {})].filter((value, index, self) => {
//       return self.indexOf(value) === index;
//     });

//     return props.reduce((compiledProps, propName) => {
//       const propIsNotUndefinedOrNull = typeof this.props[propName] !== 'undefined' && this.props[propName] !== null;
//       compiledProps[propName] = propIsNotUndefinedOrNull ? this.props[propName] : (this.defaultProps[propName] || null);
//       return compiledProps;
//     }, {});
//   }

//   handleSetProps(props) {
//     this.props = this.handleCompileProps();
//   }

//   handleAttachOptionsToInstance() {
//     this.handleAttachState(this.options?.existingState || this.options?.state);
//     this.handleAttachLifecycleMethods(this.options?.lifecycle);
//     this.handleAttachMethods(this.options?.methods);
//   }

//   handleAttachState(state = {}) {
//     if (typeof state === "function") {
//       const computedState = state(this);

//       if (
//         computedState &&
//         typeof computedState === "object" &&
//         !Array.isArray(computedState)
//       ) {
//         this.state = Object.assign({}, computedState);
//         return;
//       }
//     }

//     this.state = Object.assign({}, state);
//   }

//   handleAttachLifecycleMethods(lifecycle = {}) {
//     this.lifecycle = Object.entries(lifecycle).reduce(
//       (lifecycle = {}, [methodName, methodFunction]) => {
//         lifecycle[methodName] = () => {
//           return methodFunction(this.handleGetComponentInstance());
//         };
//         return lifecycle;
//       },
//       {}
//     );
//   }

//   handleAttachMethods(methods = {}) {
//     this.methods = Object.entries(methods).reduce(
//       (methods = {}, [methodName, methodFunction]) => {
//         methods[methodName] = (...args) => {
//           return methodFunction(...args, this.handleGetComponentInstance());
//         };
//         return methods;
//       },
//       {}
//     );
//   }

//   handleAttachEvents(parent = null) {
//     const events = serializeEvents(this.options?.events);
//     const component = this;

//     if (
//       this.lifecycle &&
//       this.lifecycle.onBeforeUnmount &&
//       typeof this.lifecycle.onBeforeUnmount === "function"
//     ) {
//       const onBeforeUnmount = function () {
//         component.lifecycle.onBeforeUnmount(component.handleGetComponentInstance());
//       };
//       window.removeEventListener("beforeunload", onBeforeUnmount);
//       window.addEventListener("beforeunload", onBeforeUnmount);
//     }

//     const joystickInstance = this.handleGetJoystickInstance();

//     events.forEach((event) => {
//       joystickInstance._internal.eventListeners.queue.array.push({
//         callback: () => {
//           const elements = [
//             ...document.querySelectorAll(
//               `[js-c="${this.id}"] ${event.selector}`
//             )
//           ];

//           if (elements && elements.length > 0) {
//             elements.forEach((element) => {
//               // NOTE: Pass this.id because we need a way to uniquely identify listeners
//               // in joystick._internal.eventListeners.attached when removing listeners.
//               addEventListener({
//                 joystickInstance,
//                 id: this.id,
//                 parentId: parent?.id,
//                 element,
//                 eventType: event.type,
//                 eventListener: function listener(DOMEvent) {
//                   Object.defineProperty(DOMEvent, "target", {
//                     value: DOMEvent.composedPath()[0],
//                   });
//                   event.handler(DOMEvent, component);
//                 },
//               });
//             });
//           }
//         },
//       });
//     });
//   }

//   handleGetRelatedEventIds(componentInTree = {}) {
//     if (componentInTree?.children?.length > 0) {
//       return componentInTree?.children?.flatMap((child) => {
//         return child?.children?.length > 0 ?
//           [child?.id].concat(this.handleGetRelatedEventIds(child)) :
//           [child.id];
//       })
//     }

//     return [];
//   }

//   handleDetachEvents() {
//     const joystickInstance = this.handleGetJoystickInstance();
//     const componentInTree = findComponentInTree(joystickInstance._internal.tree, this.id);

//     // NOTE: Go find all of the component IDs that are children of the component being re-rendered. Use these to filter
//     // the event listeners that we'll need to remove so that the re-render doesn't create duplicate listeners.
//     const eventIdsRelatedToComponent = componentInTree ? [this.id].concat(this.handleGetRelatedEventIds(componentInTree)) : [this.id];
//     const eventListeners = joystickInstance._internal.eventListeners.attached.filter((listener) => {
//       // NOTE: Do any of the IDs we scooped up from the tree match the current id of the listener
//       // being iterated over?
//       return eventIdsRelatedToComponent?.includes(listener.id);
//     });

//     const eventIds = eventListeners.map(({ eventId }) => eventId);
  
//     removeEventListeners(eventListeners);

//     joystickInstance._internal.eventListeners.attached =
//       joystickInstance._internal.eventListeners.attached.filter(
//         ({ eventId }) => {
//           return !eventIds.includes(eventId);
//         }
//       );
//   }

//   handleAttachCSS() {
//     const css = this.handleCompileCSS();

//     if (css) {
//       const styleHash = btoa(`${css.trim()}`).substring(0, 8);
//       const existingStyleForComponent = document.head.querySelector(
//         `[js-c-id="${this.id}"]`
//       );
//       const existingStyleForHash = document.head.querySelector(
//         `[js-css="${styleHash}"]`
//       );

//       const existingStylesAreChanging =
//         existingStyleForComponent && !existingStyleForHash;

//       if (existingStylesAreChanging) {
//         document.head.removeChild(existingStyleForComponent);
//       }

//       if (!existingStyleForComponent || !existingStyleForHash) {
//         const style = document.createElement("style");

//         style.innerHTML = this.handlePrefixCSS(this.options.css, this.id);

//         style.setAttribute("js-c-id", this.id);
//         style.setAttribute("js-css", styleHash);

//         document.head.appendChild(style);
//       }
//     }
//   }

//   handleGetComponentIdsFromTree(treeToWalk = {}, ids = []) {
//     const isTree = treeToWalk && treeToWalk.id;

//     if (isObject(treeToWalk) && isTree) {
//       const entries = Object.entries(treeToWalk);
  
//       for (let i = 0; i < entries.length; i += 1) {
//         const [treeKey, treeValue] = entries[i];
  
//         if (treeKey === "id") {
          
//           ids.push(treeToWalk?.id);
//         }
  
//         if (treeKey === "children" && Array.isArray(treeValue)) {
//           for (let c = 0; c < treeValue.length; c += 1) {
//             const childTree = treeValue[c];
//             this.handleGetComponentIdsFromTree(childTree, ids);
//           }
//         }
//       }
//     }
  
//     return ids;
//   }

//   handleCompileCSS() {
//     if (this.options?.css && typeof this.options?.css === "string") {
//       return this.options.css;
//     }

//     if (this.options?.css && typeof this.options?.css === "function") {
//       return this.options.css(this);
//     }

//     return "";
//   }

//   handlePrefixCSS(css = "", id = "") {
//     const rawRules = this.handleGetCSSRules(css);
//     const parsedRules = Object.entries(rawRules).map(([_key, value]) => value);

//     const prefixedRules = parsedRules.map((rule) => {
//       if (rule.constructor.name === 'CSSStyleRule') {
//         return `[js-c="${id}"] ${rule.cssText}`;
//       }

//       if (rule.constructor.name === 'CSSMediaRule') {
//         return `
//           @media ${rule.conditionText} {
//             ${Object.entries(rule.cssRules)
//               .map(([_key, mediaRule]) => `[js-c="${id}"] ${mediaRule.cssText}`)
//               .join("\n")}
//           }
//         `;
//       }
//     });

//     return prefixedRules.join("\n");
//   }

//   handleGetCSSRules(css = "") {
//     const doc = document.implementation.createHTMLDocument("");
//     const styleElement = document.createElement("style");
//     styleElement.textContent = css;
//     doc.body.appendChild(styleElement);
//     return styleElement.sheet.cssRules;
//   }

//   handleOnBeforeMount() {
//     if (this.options.lifecycle && this.options.lifecycle.onBeforeMount) {
//       this.options.lifecycle.onBeforeMount(this);
//     }
//   }

//   handleOnMount() {
//     if (this.options.lifecycle && this.options.lifecycle.onMount) {
//       this.options.lifecycle.onMount(this);
//     }
//   }

//   handleWrapHTMLForRender(html = "") {
//     return `<div ${this.wrapper?.id ? `id="${this.wrapper.id}" ` : ''}${this.wrapper?.classList ? `class="${this.wrapper.classList?.join(' ')}" ` : ''}js-ssrId="${this.ssrId}" js-c="${this.id}">${html}</div>`;
//   }

//   getDOMNodeToPatch = (vDOMNode = {}) => {
//     if (this.DOMNode) {
//       return this.DOMNode;
//       // const node = document.querySelector(
//       //   `[js-c="${vDOMNode?.attributes["js-c"]}"]`
//       // );
//       // return node;
//     }

//     return null;
//   };

//   handleSanitizeHTML(html = "") {
//     let sanitizedHTML = `${html}`;
//     const toFilter = sanitizedHTML.match(JOYSTICK_COMMENT_REGEX) || [];
//     toFilter.forEach((filter) => {
//       sanitizedHTML = sanitizedHTML.replace(filter, "");
//     });

//     return sanitizedHTML.replace(NEWLINE_REGEX, '');
//   }

//   handleGetSanitizedThis() {
//     const component = this;
//     const state =
//       typeof component.state === "function"
//         ? component.state(this)
//         : component.state;

//     component.state = state;
//     return component;
//   }

//   handleGetExistingPropsMap() {
//     const joystickInstance = this.handleGetJoystickInstance();
//     const componentInTree = findComponentInTreeBySSRId(joystickInstance?._internal?.tree, this.ssrId);
//     return componentInTree?.children?.reduce((map = {}, childComponent) => {
//       if (!map[childComponent?.instance?.ssrId]) {
//         map[childComponent?.instance?.ssrId] = childComponent?.instance?.props;
//       }

//       return map;
//     }, {});
//   }

//   handleGetExistingStateMap() {
//     const joystickInstance = this.handleGetJoystickInstance();
//     const componentInTree = findComponentInTreeBySSRId(joystickInstance?._internal?.tree, this.ssrId);
//     return componentInTree?.children?.reduce((map = {}, childComponent) => {
//       if (!map[childComponent?.instance?.ssrId]) {
//         map[childComponent?.instance?.ssrId] = childComponent?.instance?.state;
//       }

//       return map;
//     }, {});
//   }

//   renderToHTML(options = {}) {
//     if (options?.dataFromSSR) {
//       this.data = getDataFromSSR(options.dataFromSSR, this.ssrId) || {};
//     }

//     const joystickInstance = this.handleGetJoystickInstance();
//     const existingPropsMap = this.handleGetExistingPropsMap();
//     const existingStateMap = this.handleGetExistingStateMap();
//     const sanitizedThis = this.handleGetSanitizedThis();

//     // NOTE: For SSR, we have to call this no matter what in order to "discover" the children in the tree. When
//     // we call render here, we're simultaneously saying "call the component() render function for each child" component
//     // you're rendering. In effect, this allows us to scoop up data for the full tree in a first-pass scenario and then
//     // to get the compiled HTML in a second-pass scenario.
//     const html = this.options.render({
//       ...sanitizedThis,
//       setState: this.setState.bind(this),
//       ...Object.entries(renderFunctions).reduce((functions, [key, value]) => {
//         functions[key] = value.bind({
//           ...sanitizedThis,
//           existingPropsMap,
//           existingStateMap,
//           ssrTree: options?.ssrTree,
//           translations: options?.translations || this.translations || {},
//           walkingTreeForSSR: options?.walkingTreeForSSR,
//           dataFromSSR: options?.dataFromSSR,
//         });

//         return functions;
//       }, {}),
//     });

//     // NOTE: SSR has a two-pass process. First, collect data and _then_ render HTML. Here, we're preventing
//     // unnecessary work if we're doing tree/data collection.
//     const sanitizedHTML = this.handleSanitizeHTML(html);
//     const wrappedHTML = this.handleWrapHTMLForRender(sanitizedHTML);

//     return {
//       unwrapped: sanitizedHTML,
//       wrapped: wrappedHTML,
//     };
//   }

//   renderToDOM(options = {}) {
//     const html = this.renderToHTML(); // NOTE: This is the wrapped HTML.
//     const virtual = buildVDOMTree(buildVDOM(html.unwrapped, this.id));
//     const actual = options.includeActual ? render(virtual) : null;

//     return {
//       html,
//       virtual,
//       actual,
//     };
//   }

//   handleGetExistingChildIDs(joystickInstance = {}) {
//     let existingChildIds = [];

//     if (typeof window !== 'undefined' && joystickInstance?._internal?.tree) {
//       const componentInTree = findComponentInTree(joystickInstance._internal.tree, this.id);
//       existingChildIds = componentInTree?.children?.map(({ id }) => id);
//     }

//     return existingChildIds;
//   }
  
//   render(options = {}) {
//     if (options?.mounting) {
//       const updatedDOM = this.renderToDOM({ includeActual: true });
//       this.dom = updatedDOM;
//       return updatedDOM.actual;
//     }

//     const joystickInstance = this.handleGetJoystickInstance();
//     const existingChildIds = this.handleGetExistingChildIDs(joystickInstance);
    
//     const updatedDOM = this.renderToDOM({ includeActual: true });
//     const patchDOMNodes = diffVirtualDOMNodes(this.dom.virtual, updatedDOM.virtual);

//     if (patchDOMNodes && typeof patchDOMNodes === "function") {
//       this.handleDetachEvents();
      
//       joystickInstance._internal.lifecycle.onBeforeMount.process();
      
//       this.dom.actual = patchDOMNodes(this.getDOMNodeToPatch(this.dom.virtual));
//       this.dom.virtual = updatedDOM.virtual;
      
//       this.handleSetDOMNode();
//       this.handleAttachCSS();
//       this.handleAttachEvents();

//       joystickInstance._internal.domNodes.process();
//       joystickInstance._internal.eventListeners.queue.process();
//       joystickInstance._internal.lifecycle.onUpdateProps.process();

//       const componentInTree = findComponentInTree(joystickInstance._internal.tree, this.id);
      
//       updateComponentInTree(this.id, joystickInstance._internal.tree, 'children', componentInTree?.children?.filter((child) => {
//         return !existingChildIds?.includes(child?.id);
//       }));
//     }

//     // NOTE: Prevent a callback passed to setState() being called before or at the same time as
//     // the initial render triggered by a setState() call.
//     if (options?.afterSetStateRender && typeof options?.afterSetStateRender === 'function') {
//       options.afterSetStateRender();
//     }

//     if (typeof window !== 'undefined') {
//       window.joystick._internal.onRender();
//     }
//   }

//   setState(state = {}, callback = null) {
//     this.state = {
//       ...(this.state || {}),
//       ...(state || {}),
//     };

//     this.queueRender({
//       afterSetStateRender: () => {
//         if (callback && typeof callback === "function") {
//           callback();
//         }
//       },
//     });

//     // this.render({
//     //   afterSetStateRender: () => {
//     //     if (callback && typeof callback === "function") {
//     //       callback();
//     //     }
//     //   },
//     // });
//   }

//   queueRender(options = {}) {
//     if (typeof window !== 'undefined') {
//       const joystickInstance = this.handleGetJoystickInstance();
//       joystickInstance._internal.render.array.push({
//         callback: () => {
//           this.render(options);
//         },
//       });
//     } else {
//       this.render(options);
//     }
//   }
// }

// export default Component;
