import esbuild from "esbuild";
import svg from "esbuild-plugin-svg";
import build_plugins from "./plugins/index.js";
import get_code_frame from "./get_code_frame.js";
import minify_file from "../build/minify_file.js";
import on_warn from "./on_warn.js";
import path_exists from '../path_exists.js';

const handle_build_exception = async (exception = {}, file = '') => {
  const error = exception?.errors && exception?.errors[0];
  const snippet = await path_exists(file) ? await get_code_frame(file, {
    line: error?.location?.line,
    column: error?.location?.column,
  }) : null;

  await on_warn({
    file,
    stack: exception?.stack,
    line: error?.location?.line,
    column: error?.location?.column,
    snippet,
    lineWithError: error?.location?.lineText?.trim(),
    message: error?.text,
  });

  return snippet;
};

const handle_parse_file_path_from_exception = (exception = {}) => {
  const raw_error_message = exception?.message?.split(':');

  // NOTE: If the build error pertains to a file that esbuild CANNOT build, the
  // structure of the error is slightly different, placing the file(s) w/ errors
  // after the string "files:" (which lands at index 3 in the split array).
  if (raw_error_message[2] && raw_error_message[2]?.includes('No loader')) {
    return raw_error_message[3] && raw_error_message[3]?.replace('\n', '') || '';
  }

  // NOTE: IF the build error is just a syntax error, the offending file will be
  // palced at index 1.
  return raw_error_message[1] && raw_error_message[1]?.replace('\n', '') || '';
};

const handle_build_failure = async (exception = {}) => {
  const file = handle_parse_file_path_from_exception(exception);
  const snippet = await handle_build_exception(exception, file);
  
  return {
    success: false,
    path: file,
    error: {
      stack: exception?.stack,
      snippet,
    },
  };
};

const handle_build_for_node = (node_paths = [], options = {}) => {
  return esbuild.build({
    allowOverwrite: true,
    platform: "node",
    format: "esm",
    bundle: false,
    sourcemap: true,
    entryPoints: node_paths?.map((file) => file.path),
    entryNames: '[dir]/[name]',
    outdir: options?.output_path || "./.joystick/build",
    outbase: './',
    define: {
      "process.env.NODE_ENV": `'${options?.environment || 'development'}'`,
    },
    logLevel: "silent",
    plugins: [
      build_plugins.warn_node_environment,
      build_plugins.generate_file_dependency_map
    ],
  }).catch((error) => {
    console.warn('NODE', error);
  });
};

const handle_build_for_browser = (browser_paths = [], options = {}) => {
  return esbuild.build({
    allowOverwrite: true,
    target: "es2024",
    platform: "browser",
    format: "esm",
    bundle: true,
    sourcemap: true,
    entryPoints: browser_paths?.map((file) => file.path),
    entryNames: '[dir]/[name]',
    outbase: './',
    outdir: options?.output_path || "./.joystick/build",
    define: {
      "process.env.NODE_ENV": `'${options?.environment || 'development'}'`,
    },
    logLevel: 'silent',
    loader: {
      '.svg': 'text',
    },
    plugins: [
      build_plugins.warn_node_environment,
      build_plugins.generate_file_dependency_map,
      build_plugins.bootstrap_component,
      svg(),
    ]
  }).catch((error) => {
    console.warn('BROWSER', error);
  });
};

const build_files = async (options) => {
  const dirty_files = ['.DS_Store'];
  
  const node_files = options?.files?.filter((file) => {
    return !dirty_files?.some((dirty_file) => {
      return file?.path?.includes(dirty_file);
    });
  })?.filter((file) => file?.platform === 'node');

  const browser_files = options?.files?.filter((file) => {
    return !dirty_files?.some((dirty_file) => {
      return file?.path?.includes(dirty_file);
    });
  })?.filter((file) => file?.platform === 'browser');
  
  let node_file_results = [];
  let browser_file_results = [];

  if (node_files?.length > 0) {
    node_file_results = [await handle_build_for_node(node_files, options)
      .then(() => {
        return { success: true };
      }).catch((exception) => handle_build_failure(exception))];
  }

  if (browser_files?.length > 0) {
    browser_file_results = [await handle_build_for_browser(browser_files, options)
      .then(() => {
        return { success: true };
      }).catch((exception) => handle_build_failure(exception))];
  }

  const node_files_have_errors = node_file_results?.some((node_file_result) => !node_file_result?.success);
  const browser_files_have_errors = browser_file_results?.some((browser_file_result) => !browser_file_result?.success);

  if (node_files_have_errors || browser_files_have_errors) {
    return Promise.reject([
      ...node_file_results,
      ...browser_file_results,
    ]);
  }
  
  if (options?.environment && options?.environment !== 'development') {
    await Promise.all([...browser_files, ...node_files].map((file) => {
      return minify_file(`${options?.output_path || "./.joystick/build"}/${file.path}`);
    })); 
  }
  
  return [
    ...node_file_results,
    ...browser_file_results,
  ];
};

export default build_files;
