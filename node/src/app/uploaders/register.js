import multer from 'multer';
import get_browser_safe_request from '../../lib/get_browser_safe_request.js'
import handle_api_error from '../api/handle_api_error.js';
import is_valid_json from '../../lib/is_valid_json.js';
import local_upload_progress_middleware from './local_upload_progress_middleware.js';
import run_upload from './run_upload.js';
import string_to_slug from "../../lib/string_to_slug.js";
import track_function_call from '../../test/track_function_call.js';
import types from '../../lib/types.js';
import validate_uploader_options from './validate_options.js';
import validate_uploads from './validate_uploads.js';

const upload_files = async (upload_options = {}) => {
  const upload_size = parseInt(upload_options?.req?.headers["content-length"], 10);
  const providers = upload_options?.uploader_options?.providers?.includes("local")
    // NOTE: If an explicit local upload is defined, we DO NOT want to account for
  	// the transfer from the client to the server. That progress has already been
  	// tracked via the local_upload_progress_middleware.
    ? upload_options?.uploader_options?.providers.length
    // NOTE: If there IS NOT a local upload, we want to account for the transfer
    // from the client to the server.
    : upload_options?.uploader_options?.providers?.length + 1;
  const total_upload_size_all_providers = upload_size * providers;

  return run_upload({
    // NOTE: This accounts for the file being uploaded to the server which should factor in to
    // the current upload progress. More important for big files or multiple files.
    existing_upload_progress: upload_size,
    total_upload_size_all_providers,
    uploads: upload_options?.validated_uploads,
    input: upload_options?.upload_input,
    req: upload_options?.req,
  });
};

const handle_on_after_upload = async (uploader_name = '', on_after_upload = null, on_after_upload_options = {}) => {
  // NOTE: IF this throws an error, abort upload.
  await on_after_upload({
    input: on_after_upload_options?.input,
    req: on_after_upload_options?.req,
    uploads: on_after_upload_options?.uploads,
  });

  track_function_call(`node.uploaders.${uploader_name}.on_after_upload`, [{
    input: on_after_upload_options?.input,
    req: get_browser_safe_request(on_after_upload_options?.req),
    uploads: on_after_upload_options?.uploads,
  }]);
};

const handle_on_before_upload = async (uploader_name = '', on_before_upload = null, on_before_upload_options = {}) => {
  // NOTE: IF this throws an error, abort upload.
  await on_before_upload({
    input: on_before_upload_options?.input,
    req: on_before_upload_options?.req,
    uploads: on_before_upload_options?.uploads,
  });

  track_function_call(`node.uploaders.${uploader_name}.on_before_upload`, [{
    input: on_before_upload_options?.input,
    req: get_browser_safe_request(on_before_upload_options?.req),
    uploads: on_before_upload_options?.uploads,
  }]);
};

const get_uploader_input = (input = '') => {
	return input && is_valid_json(input) && JSON.parse(input);
};

const handle_upload = async (uploader_name = '', uploader_options = {}, req = {}, res = {}) => {
	try {
		const uploader_input = get_uploader_input(req?.headers['x-joystick-upload-input']);

		const validated_uploads = await validate_uploads({
			files: req?.files,
			uploader_input,
			uploader_name,
			uploader_options
	  });

		if (validated_uploads?.errors) {
			return handle_api_error(`uploaders.${uploader_name}`, validated_uploads, res);
		}

	  if (types.is_function(uploader_options?.onBeforeUpload) || types.is_function(uploader_options?.on_before_upload)) {
	  	await handle_on_before_upload(uploader_name, uploader_options?.onBeforeUpload || uploader_options?.on_before_upload, {
	      input: uploader_input,
	      req,
	      uploads: validated_uploads,
	    });
	  }

	  const uploaded_files = await upload_files({
	  	validated_uploads,
	  	uploader_input,
	  	uploader_options,
	  	req,
	  });

	  if (types.is_function(uploader_options?.onAfterUpload) || types.is_function(uploader_options?.on_after_upload)) {
	  	await handle_on_after_upload(uploader_name, uploader_options?.onAfterUpload || uploader_options?.on_after_upload, {
	      input: uploader_input,
	      req,
	      uploads: uploaded_files,
	    });
	  }

	  return res.status(200).send(JSON.stringify({ uploads: uploaded_files }));
	} catch (error) {
		handle_api_error(`uploaders.${uploader_name}`, error, res);
	}
};

const register_uploader_route = (uploader_name = '', uploader_options = {}, app_instance = {}) => {
	const formatted_uploader_name = string_to_slug(uploader_name);
	const max_upload_size = uploader_options?.maxSizeInMegabytes || uploader_options?.max_size_in_megabytes;
	const uploader = multer({ limits: { fileSize: `${max_upload_size || 10}MB` } });
	// NOTE: Max of 10 files at a time to avoid flooding the server.
	const multer_middleware = uploader.array('files', 10);
	const providers = uploader_options?.providers?.includes('local') ?
		uploader_options?.providers?.length :
		uploader_options?.providers?.length + 1;

	app_instance.express.app.post(
		`/api/_uploaders/${formatted_uploader_name}`,
		(req, res, next) => local_upload_progress_middleware(providers, req, res, next),
		// NOTE: Sigh. No other way to hook into the error handling for Multer.
		(req, res, next) => multer_middleware(req, res, (multer_error) => {
			if (multer_error) {
				let error = multer_error;

				if (multer_error?.message === 'File too large') {
					error = new Error(`Max file size is ${max_upload_size}MB.`);
				}

				handle_api_error(`uploader.${uploader_name}`, error, res);
			} else {
				next();
			}
		}),
		(req = {}, res = {}) => handle_upload(uploader_name, uploader_options, req, res),
	);
};

const warn_uploader_options_errors = (uploader_options_errors = []) => {
	if (uploader_options_errors?.length > 0) {
		for (let i = 0; i < uploader_options_errors?.length; i += 1) {
			const uploader_options_error = uploader_options_errors[i];
			console.error(uploader_options_error);
		}
	}
};

const register = (user_uploader_definitions = {}, app_instance = {}) => {
  const uploader_definitions = Object.entries(user_uploader_definitions);

  for (let i = 0; i < uploader_definitions?.length; i += 1) {
  	const [uploader_name, uploader_options] = uploader_definitions[i];
  	const uploader_options_errors = validate_uploader_options(uploader_options);

  	warn_uploader_options_errors(uploader_options_errors);

  	if (uploader_options_errors?.length === 0) {
  		register_uploader_route(uploader_name, uploader_options, app_instance);
  	}
  }
};

export default register;
