import _accounts from "./accounts";
import _cache from "./cache";
import _html from "./html";
import _renderComponentToHTML from "./component/renderComponentToHTML";
import _test from './test/index.js';
import _trackExternal from './trackExternal.js';
import _upload from "./upload";
import attachJoystickToWindow from "./attachJoystickToWindow";
import api from "./api";
import component from "./component";
import generateId from "./lib/generateId";
import mount from "./mount";
import QueueArray from "./lib/queueArray";
import updateCSSInHead from "./css/update";

export const accounts = _accounts;
export const cache = _cache;
export const get = api.get;
export const html = _html;
export const renderComponentToHTML = _renderComponentToHTML;
export const set = api.set;
export const test = _test;
export const trackExternal = _trackExternal;
export const upload = _upload;

const environment = () => {
  if (typeof window !== 'undefined') {
    return window.__joystick_env__;
  }

  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV;
  }

  return null;
};

const joystick = {
  // NOTE: Safe place to track state and data for third-party dependencies that
  // directly manipulate the DOM.
  _external: {},
  _internal: {
    css: {
      update: updateCSSInHead,
    },
    queues: {
      domNodes: new QueueArray([]),
      eventListeners: new QueueArray([]),
      lifecycle: {
        onBeforeMount: new QueueArray([]),
        onMount: new QueueArray([]),
        onUpdateProps: new QueueArray([]),
      },
      render: new QueueArray([]),
    },
    tree: {},
    eventListeners: [],
  },
  accounts,
  cache,
  component,
  env: {
    development: environment() === 'development',
    test: environment() === 'test',
  },
  get,
  html,
  id: generateId,
  mount,
  renderComponentToHTML,
  set,
  upload,
  timers: {},
  trackExternal: _trackExternal,
};

attachJoystickToWindow(joystick);

export default joystick;
