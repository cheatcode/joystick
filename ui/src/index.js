import _component from "./component";
import mount from "./mount";
import QueueArray from "./utils/queueArray";
import api from "./api";
import _accounts from "./accounts";
import _upload from './upload';

const css = new QueueArray([]);

const joystick = {
  _internal: {
    css,
    domNodes: new QueueArray([]),
    eventListeners: {
      attached: [],
      queue: new QueueArray([]),
    },
    lifecycle: {
      onBeforeMount: new QueueArray([]),
      onMount: new QueueArray([]),
      onUpdateProps: new QueueArray([]),
    },
    render: new QueueArray([], (queue) => {
      queue.process();
    }),
    timers: [],
    tree: {},
    onRender: () => {
      css.array.push({
        callback: () => {
          const renderedComponentIds = [].map.call(document.querySelectorAll('[js-c]'), (target) => {
            return target?.getAttribute('js-c');
          });
          const componentStyleTagIds = [].map.call(document.querySelectorAll('style[js-c-id]'), (target) => {
            return target?.getAttribute('js-c-id');
          });
          const extraStyleIds = componentStyleTagIds?.filter((id) => !renderedComponentIds?.includes(id));
    
          for (let i = 0; i < extraStyleIds?.length; i += 1) {
            const unnecesaryId = extraStyleIds[i];
            const existingStyleForComponent = document.head.querySelector(`[js-c-id="${unnecesaryId}"]`);
            if (existingStyleForComponent) {
              document.head.removeChild(existingStyleForComponent);
            }
          }
        },
      });

      css.process();
    },
  },
  component: _component,
  mount,
  get: api.get,
  set: api.set,
  accounts: _accounts,
};

if (typeof window !== "undefined") {
  window.joystick = window.joystick
    ? {
        ...window.joystick,
        settings: window.__joystick_settings__,
        ...joystick,
      }
    : {
        settings: window.__joystick_settings__,
        ...joystick,
      };
}

if (typeof window !== "undefined") {
  const timeout = window.setTimeout;
  const interval = window.setInterval;

  if (!window.setTimeout._tainted) {
    window.setTimeout = (callback = null, milliseconds = null) => {
      if (callback && milliseconds >= 0) {
        const timeoutId = timeout(callback, milliseconds);
        joystick._internal.timers.push({ type: "timeout", id: timeoutId });
        return timeoutId;
      }
    };

    window.setTimeout._tainted = true;
  }

  if (!window.setInterval._tainted) {
    window.setInterval = (callback = null, milliseconds = null) => {
      if (callback && milliseconds >= 0) {
        const intervalId = interval(callback, milliseconds);
        joystick._internal.timers.push({ type: "interval", id: intervalId });
        return intervalId;
      }
    };

    window.setInterval._tainted = true;
  }
}

export const component = _component;
export const get = api.get;
export const set = api.set;
export const accounts = _accounts;
export const upload = _upload;

export default joystick;
