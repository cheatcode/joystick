import URLPattern from "url-pattern";
import validateOptions from "./validateOptions";
import serializeEvents from "../utils/serializeEvents";
import addEventListener from "./addEventListener";
import removeEventListeners from "./removeEventListeners";
import buildVDOMTree from "./buildVDOMTree";
import buildVDOM from "./buildVDOM";
import render from "./render";
import diff from "./diff";
import renderFunctions from "./renderFunctions";
import joystick from "../index";
import { JOYSTICK_COMMENT_REGEX } from "./constants";
import generateId from "../utils/generateId";
import getRenderedDOMNode from './getRenderedDOMNode';
import validateForm from "../validateForm";
import get from '../api/get';
import set from '../api/set';

class Component {
  constructor(options = {}) {
    validateOptions(options);

    this.ssrId = '{x|ssrId|x}';
    this.id = options.id || generateId(8);
    this.dom = {
      virtual: {},
      actual: {},
    };

    this.options = options || {};
    this.name = "";
    this.defaultProps = options.defaultProps || {};
    this.props = options.props || {};
    this.state = {};
    this.data = {};
    this.lifecycle = {
      onBeforeMount: () => null,
      onMount: () => null,
      onBeforeUnmount: () => null,
    };
    this.methods = {};
    this.events = {};
    this.css = "";
    this.children = [];
    this.translations = options?.translations;
    this.validateForm = validateForm;
  
    this.handleSetProps();
    this.handleAttachOptionsToInstance();

    if (typeof window !== "undefined" && window.__joystick_data__ && window.__joystick_data__[this.ssrId]) {
      const dataFromWindow = window.__joystick_data__[this.ssrId] || {};
      const requestFromWindow = window.__joystick_req__ || {};
      this.data = this.handleCompileData(dataFromWindow, requestFromWindow);
    }

    if (typeof window === "undefined") {
      const url = options?.url || {};
      this.url = {
        ...url,
        isActive: (path) => {
          if (url.route !== '*') {
            const pattern = new URLPattern(url.route);
            return (url.path && url.path === path) || !!pattern.match(path);
          }

          return false;
        },
      };
    }

    if (typeof window !== "undefined" && window.__joystick_url__) {
      const url = options?.url || {};
      this.url = {
        ...window.__joystick_url__,
        isActive: (path) => {
          if (url.route !== '*') {
            const pattern = new URLPattern(window.__joystick_url__.route);
            return (window.__joystick_url__.path && window.__joystick_url__.path === path) || !!pattern.match(path);
          }

          return false;
        },
      };
    }
  }

  handleSetDOMNode() {
    const DOMNode = getRenderedDOMNode(this.id);
    this.DOMNode = DOMNode;
  }

  handleGetJoystickInstance() {
    if (typeof window !== "undefined") {
      return joystick && joystick.mountedInstance
        ? joystick
        : window.__joystick__;
    }

    return joystick;
  }

  handleCompileData(data = {}, requestFromWindow = {}) {
    return {
      ...data,
      refetch: async (input = {}) => {
        const data = await this.handleFetchData({ get, set }, requestFromWindow, input);
        this.render();
        return data;
      },
    };
  }

  async handleFetchData(api = {}, req = {}, input = {}) {
    if (this.options.data && typeof this.options.data === 'function') {
      const data = await this.options.data(api, req, input);
      this.data = this.handleCompileData(data, req);
      return this.data;
    }

    return Promise.resolve();
  }

  handleCompileProps() {
    // NOTE: Combine this.props and this.defaultProps key names and filter to uniques only.
    const props = [...Object.keys(this.props || {}), ...Object.keys(this.defaultProps || {})].filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    return props.reduce((compiledProps, propName) => {
      const propIsNotUndefinedOrNull = typeof this.props[propName] !== 'undefined' && this.props[propName] !== null;
      compiledProps[propName] = propIsNotUndefinedOrNull ? this.props[propName] : (this.defaultProps[propName] || null);
      return compiledProps;
    }, {});
  }

  handleSetProps(props) {
    this.props = this.handleCompileProps();
  }

  handleAttachOptionsToInstance() {
    this.handleAttachState(this.options?.state);
    this.handleAttachLifecycleMethods(this.options?.lifecycle);
    this.handleAttachMethods(this.options?.methods);
  }

  handleAttachState(state = {}) {
    if (typeof state === "function") {
      const computedState = state(this);

      if (
        computedState &&
        typeof computedState === "object" &&
        !Array.isArray(computedState)
      ) {
        this.state = Object.assign({}, computedState);
        return;
      }
    }

    this.state = Object.assign({}, state);
  }

  handleAttachLifecycleMethods(lifecycle = {}) {
    this.lifecycle = Object.entries(lifecycle).reduce(
      (lifecycle = {}, [methodName, methodFunction]) => {
        lifecycle[methodName] = () => {
          return methodFunction(this);
        };
        return lifecycle;
      },
      {}
    );
  }

  handleAttachMethods(methods = {}) {
    this.methods = Object.entries(methods).reduce(
      (methods = {}, [methodName, methodFunction]) => {
        methods[methodName] = (...args) => {
          return methodFunction(...args, this);
        };
        return methods;
      },
      {}
    );
  }

  handleAttachEvents(parent = null) {
    const events = serializeEvents(this.options?.events);
    const component = this;

    if (
      this.lifecycle &&
      this.lifecycle.onBeforeUnmount &&
      typeof this.lifecycle.onBeforeUnmount === "function"
    ) {
      const onBeforeUnmount = function () {
        component.lifecycle.onBeforeUnmount(component);
      };
      window.removeEventListener("beforeunload", onBeforeUnmount);
      window.addEventListener("beforeunload", onBeforeUnmount);
    }

    const joystickInstance = this.handleGetJoystickInstance();

    events.forEach((event) => {
      joystickInstance._internal.eventListeners.queue.array.push({
        callback: () => {
          const elements = [
            ...document.querySelectorAll(
              `[js-c="${this.id}"] ${event.selector}`
            )
          ];

          if (elements && elements.length > 0) {
            elements.forEach((element) => {
              // NOTE: Pass this.id because we need a way to uniquely identify listeners
              // in joystick._internal.eventListeners.attached when removing listeners.
              addEventListener({
                joystickInstance,
                id: this.id,
                parentId: parent?.id,
                element,
                eventType: event.type,
                eventListener: function listener(DOMEvent) {
                  Object.defineProperty(DOMEvent, "target", {
                    value: DOMEvent.composedPath()[0],
                  });
                  event.handler(DOMEvent, component);
                },
              });
            });
          }
        },
      });
    });
  }

  handleDetachEvents() {
    const joystickInstance = this.handleGetJoystickInstance();
    const eventListeners =
      joystickInstance._internal.eventListeners.attached.filter(
        ({ id, parentId }) => {
          return id === this.id || parentId === this.id;
        }
      );

    const eventIds = eventListeners.map(({ eventId }) => eventId);
    removeEventListeners(eventListeners);
    joystickInstance._internal.eventListeners.attached =
      joystickInstance._internal.eventListeners.attached.filter(
        ({ eventId }) => {
          return !eventIds.includes(eventId);
        }
      );
  }

  handleAttachCSS() {
    const css = this.handleCompileCSS();

    if (css) {
      const styleHash = btoa(css.trim()).substring(0, 8);
      const existingStyleForComponent = document.head.querySelector(
        `[js-c-id="${this.id}"]`
      );
      const existingStyleForHash = document.head.querySelector(
        `[js-css="${styleHash}"]`
      );

      const existingStylesAreChanging =
        existingStyleForComponent && !existingStyleForHash;

      if (existingStylesAreChanging) {
        document.head.removeChild(existingStyleForComponent);
      }

      if (!existingStyleForComponent || !existingStyleForHash) {
        const style = document.createElement("style");

        style.innerHTML = this.handlePrefixCSS(this.options.css, this.id);

        style.setAttribute("js-c-id", this.id);
        style.setAttribute("js-css", styleHash);

        document.head.appendChild(style);
      }
    }
  }

  handleCompileCSS() {
    if (this.options?.css && typeof this.options?.css === "string") {
      return this.options.css;
    }

    if (this.options?.css && typeof this.options?.css === "function") {
      return this.options.css(this);
    }

    return "";
  }

  handlePrefixCSS(css = "", id = "") {
    const rawRules = this.handleGetCSSRules(css);
    const parsedRules = Object.entries(rawRules).map(([_key, value]) => value);

    const prefixedRules = parsedRules.map((rule) => {
      if (rule.type === 1) {
        return `[js-c="${id}"] ${rule.cssText}`;
      }

      if (rule.type === 4) {
        return `
          @media ${rule.conditionText} {
            ${Object.entries(rule.cssRules)
              .map(([_key, mediaRule]) => `[js-c="${id}"] ${mediaRule.cssText}`)
              .join("\n")}
          }
        `;
      }
    });

    return prefixedRules.join("\n");
  }

  handleGetCSSRules(css = "") {
    const doc = document.implementation.createHTMLDocument("");
    const styleElement = document.createElement("style");
    styleElement.textContent = css;
    doc.body.appendChild(styleElement);
    return styleElement.sheet.cssRules;
  }

  handleOnBeforeMount() {
    if (this.options.lifecycle && this.options.lifecycle.onBeforeMount) {
      this.options.lifecycle.onBeforeMount(this);
    }
  }

  handleOnMount() {
    if (this.options.lifecycle && this.options.lifecycle.onMount) {
      this.options.lifecycle.onMount(this);
    }
  }

  handleWrapHTMLForRender(html = "") {
    return `<div js-c="${this.id}">${html}</div>`;
  }

  getDOMNodeToPatch = (vDOMNode = {}) => {
    if (vDOMNode) {
      const node = document.querySelector(
        `[js-c="${vDOMNode?.attributes["js-c"]}"]`
      );
      return node;
    }

    return null;
  };

  render(options = {}) {
    if (options && options.mounting) {
      const updatedDOM = this.renderToDOM({ includeActual: true });
      this.dom = updatedDOM;
      return updatedDOM.actual;
    }

    const updatedDOM = this.renderToDOM({ includeActual: true });
    const patch = diff(this.dom.virtual, updatedDOM.virtual);

    if (patch && typeof patch === "function") {
      this.handleDetachEvents();
      this.dom.actual = patch(this.getDOMNodeToPatch(this.dom.virtual));
      this.dom.virtual = updatedDOM.virtual;

      this.handleSetDOMNode();
      this.handleAttachCSS();
      this.handleAttachEvents();

      const joystickInstance = this.handleGetJoystickInstance();
      joystickInstance._internal.eventListeners.queue.process();
    }
  }

  handleSanitizeHTML(html = "") {
    let sanitizedHTML = `${html}`;
    const toFilter = sanitizedHTML.match(JOYSTICK_COMMENT_REGEX) || [];
    toFilter.forEach((filter) => {
      sanitizedHTML = sanitizedHTML.replace(filter, "");
    });
    return sanitizedHTML;
  }

  handleGetSanitizedThis() {
    const component = this;
    const state =
      typeof component.state === "function"
        ? component.state(this)
        : component.state;

    component.state = state;
    return component;
  }

  renderToHTML(ssrTree = null, renderTranslations = null) {
    const sanitizedThis = this.handleGetSanitizedThis();
    const html = this.options.render({
      ...sanitizedThis,
      ...Object.entries(renderFunctions).reduce((functions, [key, value]) => {
        functions[key] = value.bind({
          ...sanitizedThis,
          ssrTree,
          dataFunctions: this.options.dataFunctions,
          translations: renderTranslations || this.translations || {},
        });

        return functions;
      }, {}),
    });

    const sanitizedHTML = this.handleSanitizeHTML(html);
    const wrappedHTML = this.handleWrapHTMLForRender(sanitizedHTML);

    return {
      unwrapped: sanitizedHTML,
      wrapped: wrappedHTML,
    };
  }

  renderToDOM(options = {}) {
    const html = this.renderToHTML(); // NOTE: This is the wrapped HTML.
    const virtual = buildVDOMTree(buildVDOM(html.unwrapped, this.id));
    const actual = options.includeActual ? render(virtual) : null;

    return {
      html,
      virtual,
      actual,
    };
  }

  setState(state = {}, callback = null) {
    this.state = Object.assign(this.state, state);
    this.render();

    if (callback && typeof callback === "function") {
      callback();
    }
  }
}

export default Component;
