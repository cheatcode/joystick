import { URL, URLSearchParams } from "url";
import fetch from 'node-fetch';
import generateCookieHeader from "../../lib/generateCookieHeader.js";

const runRoute = (route = '', method = '', options = {}) => {
  const methodName = method?.toLocaleLowerCase();
  const fetchOptions = {
    method: methodName,
    mode: 'cors',
    headers: {
      connect: {
        ...(options?.headers || {}),
      },
      delete: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      get: {
        ...(options?.headers || {}),
      },
      head: {
        ...(options?.headers || {}),
      },
      options: {
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
    }[methodName] || {
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  };

  if (options?.user) {
    fetchOptions.headers.Cookie = generateCookieHeader({
      joystickLoginToken: options?.user?.joystickLoginToken,
      joystickLoginTokenExpiresAt: options?.user?.joystickLoginTokenExpiresAt,
    });
  }

  if (['delete', 'patch', 'post', 'put'].includes(methodName) && options?.body) {
    fetchOptions.body = JSON.stringify(options?.body);
  }

  const url = new URL(`http://localhost:${process.env.PORT}${route}`);

  if (options?.query) {
    url.search = new URLSearchParams(options?.query || {});
  }

  return fetch(url, fetchOptions).then(async (response) => {
    const responseType = response?.headers?.get('content-type');
    const headers =  Object.fromEntries(response.headers.entries());

    if (responseType?.includes('text/html')) {
      return {
        headers,
        body: await response.text(),
      };
    }

    if (responseType?.includes('application/json')) {
      return {
        headers,
        body: await response.json(),
      };
    }
  }).catch((error) => {
    return error;
  });
};

export default {
  connect: (route = '', options = {}) => {
    return runRoute(route, 'CONNECT', options);
  },
  delete: (route = '', options = {}) => {
    return runRoute(route, 'DELETE', options);
  },
  get: (route = '', options = {}) => {
    return runRoute(route, 'GET', options);
  },
  head: (route = '', options = {}) => {
    return runRoute(route, 'HEAD', options);
  },
  options: (route = '', options = {}) => {
    return runRoute(route, 'OPTIONS', options);
  },
  patch: (route = '', options = {}) => {
    return runRoute(route, 'PATCH', options);
  },
  post: (route = '', options = {}) => {
    return runRoute(route, 'POST', options);
  },
  put: (route = '', options = {}) => {
    return runRoute(route, 'PUT', options);
  },
};
