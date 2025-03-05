import compression from 'compression';
import cookieParser from "cookie-parser";
import cors from 'cors';
import express from 'express';
import favicon from "serve-favicon";
import account_middleware from './account.js';
import body_parser from './body_parser.js';
import build_error_middleware from './build_error.js';
import context_middleware from './context.js';
import detect_device_type from './detect_device_type.js';
import get_joystick_build_path from '../../lib/get_joystick_build_path.js';
import hmr_client_middleware from './hmr_client.js';
import insecure_middleware from './insecure.js';
import path_exists from '../../lib/path_exists.js';
import process_browser_polyfill_middleware from './process_browser_polyfill.js';
import render_middleware from './render/index.js';
import request_methods_middleware from './request_methods.js';
import session_middleware from './session.js';

const build_path = get_joystick_build_path();

const built_in = (options = {}) => {
	options.express_app.set('trust proxy', 1);
  options.express_app.use(build_error_middleware);

  if (!['development', 'test'].includes(process.env.NODE_ENV)) {
    options.express_app.use(insecure_middleware);
  }

  if (options?.csp_config) {
    options.express_app.use((req, res, next) => csp(req, res, next, options?.csp_config));
  }

  if (process.env.NODE_ENV !== 'development') {
		options.express_app.use(compression());
	}

  options.express_app.use(express.static('public'));
  options.express_app.use('/_joystick/utils/process.js', process_browser_polyfill_middleware);
  options.express_app.use('/_joystick', express.static(options?.joystick_build_path));
  // options.express_app.use('/_joystick/ui', express.static(`${build_path}ui`));

  // NOTE: Difference here is that if the /index.css imports a file from the /css folder
  // at the root of the app, the import URL will be prefixed w/ /_joystick. This ensures
  // that the path still resolves whether you're loading directly from /css or importing
  // from within /index.css.
  options.express_app.use('/css', express.static('css'));
  options.express_app.use('/_joystick/css', express.static('css'));
  
  options.express_app.use(async (req, res, next) => {
    const favicon_exists = await path_exists('public/favicon.ico');
    if (favicon_exists) {
      favicon('public/favicon.ico')(req, res, next);
    } else {
      next();
    }
  });

  options.express_app.use(cookieParser());
  options.express_app.use(body_parser(options?.middleware_config?.bodyParser));

  options.express_app.use(cors(options?.middleware_config?.cors, options?.port));
	options.express_app.use(request_methods_middleware);

  options.express_app.use((req, _res, next) => {
    req.device = detect_device_type(req);
    next();
  });

  if (process.databases?._sessions) {
    options.express_app.use((req, res, next) => session_middleware(req, res, next));
  }

  if (process.databases?._users) {
    options.express_app.use((req, res, next) => account_middleware(req, res, next));
  }

  options.express_app.use((req, res, next) => context_middleware(req, res, next));

  if (options?.middleware_config?.public_paths?.length > 0) {
    for (let i = 0; i < options?.middleware_config?.public_paths?.length; i += 1) {
      const custom_public_path = options?.middleware_config?.public_paths[i];
      options.express_app.use(custom_public_path?.route, express.static(custom_public_path?.directory));
    }
  }

  options.express_app.use((req, res, next) => render_middleware(req, res, next, options?.app_instance));


  if (process.env.NODE_ENV === 'development') {
  	options.express_app.use("/_joystick/hmr/client.js", hmr_client_middleware);
  }
};

export default built_in;
