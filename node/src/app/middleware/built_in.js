import compression from 'compression';
import cookieParser from "cookie-parser";
import cors from 'cors';
import express from 'express';
import favicon from "serve-favicon";
import fs from 'fs/promises';
import path from 'path';
import account_middleware from './account.js';
import body_parser from './body_parser.js';
import build_error_middleware from './build_error.js';
import csp from './csp.js';
import context_middleware from './context.js';
import detect_device_type from './detect_device_type.js';
import get_joystick_build_path from '../../lib/get_joystick_build_path.js';
import hmr_client_middleware from './hmr_client.js';
import insecure_middleware from './insecure.js';
import path_exists from '../../lib/path_exists.js';
import process_browser_polyfill_middleware from './process_browser_polyfill.js';
import render_middleware from './render/index.js';
import request_methods_middleware from './request_methods.js';
import cookie_session_middleware from './cookie_session.js';

const build_path = get_joystick_build_path();

const find_favicon_path = async (directory, options = {}) => {
  const files = await fs.readdir(directory);
  const has_png = files.includes('favicon.png');
  const has_ico = files.includes('favicon.ico');

  if (options.prefer_png) {
    if (has_png) return path.join(directory, 'favicon.png');
    if (has_ico) return path.join(directory, 'favicon.ico');
  } else {
    if (has_ico) return path.join(directory, 'favicon.ico');
    if (has_png) return path.join(directory, 'favicon.png');
  }

  return null;
};

const favicon_path = await find_favicon_path('public', { prefer_png: true });

const is_api_route = (req) => {
  return req.path.startsWith('/api/') || req.path.startsWith('/_api/');
};

const is_ui_route = (req) => {
  return !is_api_route(req);
};

const create_conditional_middleware = (middleware_fn, condition_fn) => {
  return (req, res, next) => {
    if (condition_fn(req)) {
      return middleware_fn(req, res, next);
    }
    next();
  };
};

const get_middleware_groups = (options = {}) => {
  const thing = [];

  const global_middleware = [
    ...thing,
    (req, res, next) => {
      if (!req.app.get('trust proxy')) {
        req.app.set('trust proxy', 1);
      }
      next();
    },

    build_error_middleware,

    (req, res, next) => {
      if (!['development', 'test'].includes(process.env.NODE_ENV)) {
        return insecure_middleware(req, res, next);
      }
      next();
    },

    (req, res, next) => {
      if (process.env.NODE_ENV !== 'development') {
        return compression()(req, res, next);
      }
      next();
    },

    express.static('public'),

    { path: '/_joystick/utils/process.js', middleware: process_browser_polyfill_middleware },
    { path: '/_joystick/index.client.js', middleware: express.static(`${options?.joystick_build_path}index.client.js`) },
    { path: '/_joystick/index.css', middleware: express.static(`${options?.joystick_build_path}index.css`) },
    { path: '/_joystick/ui', middleware: express.static(`${options?.joystick_build_path || build_path}/ui`) },
    { path: '/_joystick/css', middleware: express.static('css') },
    {
      path: `/_joystick/mod/mod-light.css`,
      middleware: (req = {}, res = {}, next) => {
        res.setHeader('content-type', 'text/css');
        return res.status(200).send(options?.mod?.css?.light || '');
      },
    },
    {
      path: `/_joystick/mod/mod-dark.css`,
      middleware: (req = {}, res = {}, next) => {
        res.setHeader('content-type', 'text/css');
        return res.status(200).send(options?.mod?.css?.dark || '');
      },
    },
    {
      path: `/_joystick/mod/mod.js`,
      middleware: (req = {}, res = {}, next) => {
        res.setHeader('content-type', 'text/javascript');
        return res.status(200).send(options?.mod?.js?.iife || '');
      },
    },

    { path: '/css', middleware: express.static('css') },

    cookieParser(),
    (req = {}, res = {}, next) => {
      if (!req?.cookies?.theme) {
        // NOTE: Set a default theme for the visitor if they don't have one set.
        res.cookie('theme', 'light');        
      }

      next();
    },
    body_parser(options?.middleware_config?.bodyParser),
    cors(options?.middleware_config?.cors, options?.port),
    request_methods_middleware,
    (req, _res, next) => {
      req.device = detect_device_type(req);
      next();
    },

    cookie_session_middleware,

    (req, res, next) => {
      if (process.databases?._users) {
        return account_middleware(req, res, next);
      }
      next();
    },

    context_middleware,

    (req, res, next) => {
      if (options?.middleware_config?.public_paths?.length > 0) {
        for (let i = 0; i < options?.middleware_config?.public_paths?.length; i += 1) {
          const custom_public_path = options?.middleware_config?.public_paths[i];
          if (req.path.startsWith(custom_public_path?.route)) {
            return express.static(custom_public_path?.directory)(req, res, next);
          }
        }
      }
      next();
    },
  ];

  const ui_middleware = [
    (req, res, next) => {
      if (options?.csp_config) {
        return csp(req, res, next, options?.csp_config);
      }
      next();
    },

    async (req, res, next) => {
      if (favicon_path) {
        favicon(favicon_path)(req, res, next);
      } else {
        next();
      }
    },    

    (req, res, next) => render_middleware(req, res, next, options?.app_instance),

    (req, res, next) => {
      if (process.env.NODE_ENV === 'development' && req.path === '/_joystick/hmr/client.js') {
        return hmr_client_middleware(req, res, next);
      }
      next();
    }
  ];

  const api_middleware = [];

  return {
    global: global_middleware,
    ui: ui_middleware,
    api: api_middleware
  };
};

const apply_middleware_groups = (express_app, middleware_groups) => {
  for (let i = 0; i < middleware_groups.global.length; i += 1) {
    const middleware_item = middleware_groups.global[i];
    if (typeof middleware_item === 'object' && middleware_item.path && middleware_item.middleware) {
      express_app.use(middleware_item.path, middleware_item.middleware);
    } else {
      express_app.use(middleware_item);
    }
  }

  for (let i = 0; i < middleware_groups.ui.length; i += 1) {
    express_app.use(create_conditional_middleware(middleware_groups.ui[i], is_ui_route));
  }

  for (let i = 0; i < middleware_groups.api.length; i += 1) {
    express_app.use(create_conditional_middleware(middleware_groups.api[i], is_api_route));
  }
};

const built_in = (options = {}) => {
  const middleware_groups = get_middleware_groups(options);
  apply_middleware_groups(options.express_app, middleware_groups);
};

export default built_in;
