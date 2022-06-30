import _component from "./component";
import _accounts from "./accounts";
import _upload from './upload';
import mount from "./mount";
import api from "./api";
import QueueArray from "./lib/queueArray";
import attachJoystickToWindow from "./attachJoystickToWindow";
import overrideTimers from "./overrideTimers";

export const component = _component;
export const get = api.get;
export const set = api.set;
export const accounts = _accounts;
export const upload = _upload;

const joystick = {
  component,
  get,
  set,
  accounts,
  upload,
  mount,
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
    timers: [],
  },
}

attachJoystickToWindow(joystick);
overrideTimers();

export default joystick;
