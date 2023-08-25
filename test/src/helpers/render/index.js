
import { parseHTML } from 'linkedom';
import joystick from '@joystick.js/ui-canary';
import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import event from './event.js';
import load from "../load/index.js";
import generateCookieHeader from "../../lib/generateCookieHeader.js";

const bootstrapWindow = async (pathToComponent = '', options = {}) => {
  const url = new URL(`${window?.location?.origin}/api/_test/bootstrap`);
  url.search = new URLSearchParams({ pathToComponent });

  const bootstrapRequestOptions = {
    cache: 'no-store',
  };

  if (options?.user) {
    bootstrapRequestOptions.headers = {
      Cookie: generateCookieHeader({
        joystickLoginToken: options?.user?.joystickLoginToken,
        joystickLoginTokenExpiresAt: options?.user?.joystickLoginTokenExpiresAt,
      }),
    };
  }

  const bootstrap = await fetch(url, bootstrapRequestOptions).then(async (response) => response.json());

  window.joystick = {
    settings: bootstrap?.settings || {}
  };

  window.__joystick_test__ = true;
  window.__joystick_data__ = bootstrap?.data || {};
  window.__joystick_i18n__ = bootstrap?.translations || {};
  window.__joystick_req__ = bootstrap?.req;
  window.__joystick_url__ = options?.url || {
    params: {},
    path: '/',
    query: {},
    route: '/',
  };
};

const loadDOM = () => {
  const dom = parseHTML(`
    <html>
      <head></head>
      <body>
        <div id="app"></div>
        <meta name="csrf" content="joystick_test" />
      </body>
    </html>
  `);

  const { window, document, Element, Event, HTMLElement } = dom;

  global.window = window;
  global.document = document;
  global.HTMLElement = HTMLElement;
  global.Element = Element;
  global.Event = Event;
  global.console = {
   log: console.log,
   warn: console.warn,
   error: console.error,
  };

  return dom;
};

export default async (pathToComponent = '', options = {}) => {
  const dom = loadDOM();

  window.fetch = fetch;
  window.location = {
    origin: `http://localhost:${process.env.PORT}`,
  };

  await bootstrapWindow(pathToComponent, options?.user);

  // NOTE: Force default to true as that's the prescribed pattern for
  // Joystick component files.
  const Component = await load(pathToComponent, { default: true });
  const Layout = options?.layout ? await load(options?.layout, { default: true }) : null;
  const props = {
    ...(options?.props || {}),
  };
  
  if (options?.layout) {
    props.page = Component;  
  }
  
  const component = joystick.mount(Layout || Component, props, dom?.document.querySelector('#app'));

  return {
    dom,
    instance: component,
    test: {
      data: async (input = {}) => {
        return component?.data?.refetch(input);
      },
      renderToHTML: () => {
        const html = component?.renderToHTML();
        const whenRegex = new RegExp('<when>|</when>', 'g');
        return html?.wrapped?.replace(whenRegex, '')?.replace(/\n|\t/g, ' ')?.replace(/> *</g, '><');
      },
      method: (methodName = '', ...methodArgs) => {
        const methodToCall = component?.methods[methodName];

        if (!methodToCall) {
          return null;
        }

        return methodToCall(...methodArgs);
      },
      event: (eventType = '', eventTarget = '', overrides = {}) => {
        return event(eventType, eventTarget, dom, overrides);
      },
    },
  };
};
