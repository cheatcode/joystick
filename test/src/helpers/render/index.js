import { parseHTML } from 'linkedom';
import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import event from './event.js';
import load from "../load/index.js";
import generate_cookie_header from "../../lib/generate_cookie_header.js";

const bootstrap_window = async (path_to_component = '', render_options = {}) => {
  const url = new URL(`${window?.location?.origin}/api/_test/bootstrap`);
  url.search = new URLSearchParams({ path_to_component });

  const bootstrap_request_options = {
    cache: 'no-store',
  };

  const cookie_data = {};
  
  if (render_options?.options?.user) {
    cookie_data.joystick_login_token = render_options?.options?.user?.joystick_login_token;
    cookie_data.joystick_login_token_expires_at = render_options?.options?.user?.joystick_login_token_expires_at;
  }
  
  if (render_options?.options?.language_cookie) {
    cookie_data.language = render_options?.options?.language_cookie;
  }

  bootstrap_request_options.headers = {
    'Accept-Language': render_options?.options?.language ||  '',
    Cookie: Object.keys(cookie_data).length > 0 ? generate_cookie_header(cookie_data) : '',
  };

  const bootstrap = await fetch(url, bootstrap_request_options).then(async (response) => response.json());

  window.joystick = {
    settings: bootstrap?.settings || {}
  };

  window.__joystick_test__ = true;
  window.__joystick_data__ = bootstrap?.data || {};
  window.__joystick_i18n__ = bootstrap?.translations || {};
  window.__joystick_req__ = bootstrap?.req;
  window.__joystick_url__ = render_options?.url || {
    params: {},
    path: '/',
    query: {},
    route: '/',
  };
};

const load_dom = () => {
  const dom = parseHTML(`
    <html>
      <head></head>
      <body>
        <div id="app"></div>
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

const render = async (path_to_component = '', render_options = {}) => {
  const dom = load_dom();

  window.fetch = fetch;
  window.location = {
    origin: `http://localhost:${process.env.PORT}`,
  };

  await bootstrap_window(path_to_component, render_options);

  // NOTE: Force default to true as that's the prescribed pattern for
  // Joystick component files.
  const component_to_render = await load(path_to_component, { default: true });
  const layout_to_render = render_options?.layout ? await load(render_options?.layout, { default: true }) : null;
  const props = {
    ...(render_options?.props || {}),
  };
  
  if (render_options?.layout) {
    props.page = component_to_render;  
  }
  
  const component = global.joystick.mount(layout_to_render || component_to_render, props, dom?.document.querySelector('#app'));

  const render_to_html = () => {
    console.log('rth component', component);
    const html = component?.render_to_html();
    const when_regex = new RegExp('<when>|</when>', 'g');
    return html?.replace(when_regex, '')?.replace(/\n|\t/g, ' ')?.replace(/> *</g, '><');
  };

  return {
    dom,
    instance: component,
    test: {
      data: async (input = {}) => {
        return component?.data?.refetch(input);
      },
      renderToHTML: render_to_html,
      render_to_html,
      method: (method_name = '', ...method_args) => {
        const method_to_call = component?.methods[method_name];

        if (!method_to_call) {
          return null;
        }

        return method_to_call(...method_args);
      },
      event: (event_type = '', event_target = '', overrides = {}) => {
        return event(event_type, event_target, dom, overrides);
      },
    },
  };
};

export default render;
