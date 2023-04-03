import component from "./component";
import _renderComponentToHTML from './component/renderComponentToHTML';
import _accounts from "./accounts";
import _upload from './upload';
import _cache from './cache';
import _html from './html';
import mount from "./mount";
import api from "./api";
import QueueArray from "./lib/queueArray";
import attachJoystickToWindow from "./attachJoystickToWindow";
import overrideTimers from "./overrideTimers";
import generateId from "./lib/generateId";

export const get = api.get;
export const set = api.set;
export const accounts = _accounts;
export const upload = _upload;
export const cache = _cache;
export const html = _html;
export const renderComponentToHTML = _renderComponentToHTML;

const joystick = {
  _internal: {
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
  get,
  html,
  id: generateId,
  mount,
  renderComponentToHTML,
  set,
  upload,
  timers: {},
  // NOTE: Safe place to track state and data for third-party dependencies that
  // directly manipulate the DOM.
  _external: {},
}

attachJoystickToWindow(joystick);
// overrideTimers();

export default joystick;
