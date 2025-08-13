import { URL, URLSearchParams } from "url";
import fetch from 'node-fetch';
import generate_cookie_header from "../../lib/generate_cookie_header.js";
import get_test_port from "../../lib/get_test_port.js";

const run_route = (route = '', method = '', options = {}) => {
  const method_name = method?.toLocaleLowerCase();
  const fetch_options = {
    method: method_name,
    mode: 'cors',
    headers: {
      get: {
        ...(options?.headers || {}),
      },
      delete: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      patch: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      post: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      put: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    }[method_name] || {
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  };

  if (options?.user) {
    fetch_options.headers.Cookie = generate_cookie_header({
      joystick_login_token: options?.user?.joystick_login_token,
      joystick_login_token_expires_at: options?.user?.joystick_login_token_expires_at,
    });
  }

  if (['delete', 'patch', 'post', 'put'].includes(method_name) && options?.body) {
    fetch_options.body = JSON.stringify(options?.body);
  }

  const url = new URL(`http://localhost:${get_test_port()}${route}`);

  if (options?.query) {
    url.search = new URLSearchParams(options?.query || {});
  }

  return fetch(url, fetch_options).then(async (response) => {
    const response_type = response?.headers?.get('content-type');
    const headers =  Object.fromEntries(response.headers.entries());

    if (response_type?.includes('text/html')) {
      return {
        headers,
        body: await response.text(),
      };
    }

    if (response_type?.includes('application/json')) {
      return {
        headers,
        body: await response.json(),
      };
    }

    return null;
  }).catch((error) => {
    return error;
  });
};

const routes = {
  get: (route = '', options = {}) => {
    return run_route(route, 'GET', options);
  },
  delete: (route = '', options = {}) => {
    return run_route(route, 'DELETE', options);
  },
  patch: (route = '', options = {}) => {
    return run_route(route, 'PATCH', options);
  },
  post: (route = '', options = {}) => {
    return run_route(route, 'POST', options);
  },
  put: (route = '', options = {}) => {
    return run_route(route, 'PUT', options);
  },
};

export default routes;
