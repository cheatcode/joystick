import fs from "fs-extra";
import esbuild from "esbuild";
import svg from "esbuild-plugin-svg";
import filesToCopy from "../filesToCopy.js";
import minifyFile from "../build/minifyFile.js";
import browserPaths from "./browserPaths.js";
import browserPathExclusions from "./browserPathExclusions.js";
import nodePaths from "./nodePaths.js";
import nodePathExclusions from "./nodePathExclusions.js";
import buildPlugins from "./buildPlugins.js";
import getCodeFrame from "./getCodeFrame.js";
import onWarn from "./onWarn.js";

const handleBuildException = (exception = {}, file = '') => {
  try {
    const error = exception?.errors && exception?.errors[0];
    const snippet = fs.existsSync(file)
      ? getCodeFrame(file, {
        line: error?.location?.line,
        column: error?.location?.column,
      })
      : null;

    onWarn({
      file,
      stack: exception?.stack,
      line: error?.location?.line,
      column: error?.location?.column,
      snippet,
      lineWithError: error?.location?.lineText?.trim(),
      message: error?.text,
    });

    return snippet;
  } catch (exception) {
    throw new Error(`[actionName.handleBuildException] ${exception.message}`);
  }
};

const handleParseFilePathFromException = (exception = {}) => {
  try {
    const rawErrorMessage = exception?.message?.split(':');
    return rawErrorMessage[1] && rawErrorMessage[1]?.replace('\n', '') || '';
  } catch (exception) {
    throw new Error(`[actionName.handleParseFilePathFromException] ${exception.message}`);
  }
};

const handleBuildForNode = (nodePaths = [], options = {}) => {
  try {
    return esbuild.build({
      platform: "node",
      format: "esm",
      bundle: false,
      entryPoints: nodePaths?.map((file) => file.path),
      entryNames: '[dir]/[name]',
      // TODO: Make sure we don't need outbase here so the paths map correctly.
      outdir: options?.outputPath || "./.joystick/build",
      outbase: './',
      define: {
        "process.env.NODE_ENV": `'${options?.environment}'`,
      },
      logLevel: "silent",
      plugins: [
        buildPlugins.warnNodeEnvironment,
        buildPlugins.generateFileDependencyMap
      ],
    });
  } catch (exception) {
    throw new Error(`[buildFiles.handleBuildForNode] ${exception.message}`);
  }
};

const handleBuildForBrowser = (browserPaths = [], options = {}) => {
  try {
    return esbuild.build({
      target: "es2020",
      platform: "browser",
      format: "esm",
      bundle: true,
      entryPoints: browserPaths?.map((file) => file.path),
      entryNames: '[dir]/[name]',
      outbase: './',
      // TODO: Make sure we don't need outbase here so the paths map correctly.
      outdir: options?.outputPath || "./.joystick/build",
      define: {
        "process.env.NODE_ENV": `'${options?.environment}'`,
      },
      logLevel: 'silent',
      plugins: [
        buildPlugins.warnNodeEnvironment,
        buildPlugins.generateFileDependencyMap,
        buildPlugins.bootstrapComponent,
        svg(),
      ]
    });
  } catch (exception) {
    throw new Error(`[buildFiles.handleBuildForBrowser] ${exception.message}`);
  }
};

const handleCopyFiles = (files = [], outputPath = '') => {
  try {
    for (let i = 0; i < files?.length; i += 1) {
      const file = files[i];
      const fileContents = fs.readFileSync(file.path);
      
      // NOTE: Using fs.outputFileSync() from fs-extra to ensure parent path is created
      // if it doesn't exist (avoids need for separate fs.mkdirSync()).
      fs.outputFileSync(
        `${outputPath || "./.joystick/build"}/${file.path}`,
        fileContents
      );
    }
  } catch (exception) {
    throw new Error(`[buildFiles.handleCopyFiles] ${exception.message}`);
  }
};

const isNodePath = (path = '') => {
  try {
    return !isNotJavaScript(path) && nodePaths.some((nodePath) => {
      return path.includes(nodePath);
    }) &&
    !nodePathExclusions.some((nodeExclusionPath) => {
      return path.includes(nodeExclusionPath);
    });
  } catch (exception) {
    throw new Error(`[buildFiles.isNodePath] ${exception.message}`);
  }
};

const isBrowserPath = (path = '') => {
  try {
    return !isNotJavaScript(path) && browserPaths.some((browserPath) => {
      return path.includes(browserPath);
    }) &&
    !browserPathExclusions.some((browserExclusionPath) => {
      return path.includes(browserExclusionPath);
    });
  } catch (exception) {
    throw new Error(`[buildFiles.isBrowserPath] ${exception.message}`);
  }
};

const isNotJavaScript = (path = '') => {
  try {
    const extension = path.split(".").pop();
    return extension && !extension.match(/js$/);
  } catch (exception) {
    throw new Error(`[buildFiles.isNotJavaScript] ${exception.message}`);
  }
};

const isCopyPath = (path = '') => {
  try {
    const hasCopyRegexMatch = filesToCopy.some((fileToCopy) => {
      return fileToCopy.regex.test(path);
    });
    
    return isNotJavaScript(path) || hasCopyRegexMatch;
  } catch (exception) {
    throw new Error(`[buildFiles.isCopyPath] ${exception.message}`);
  }
};

const getFilePlatform = (path = '') => {
  try {
    let platform = "";
  
    const isCopy = isCopyPath(path);
    const isBrowser = isBrowserPath(path);
    const isNode = isNodePath(path);
    
    if (isCopy) {
      platform = "copy";
    }

    if (isBrowser) {
      platform = "browser";
    }

    if (isNode) {
      platform = "node";
    }

    return platform;
  } catch (exception) {
    throw new Error(`[buildFiles.getFilePlatform] ${exception.message}`);
  }
};

const getFilesWithPlatform = (files = []) => {
  try {
    return files?.map((file = '') => {
      return {
        path: file,
        platform: getFilePlatform(file),
      };
    });
  } catch (exception) {
    throw new Error(`[buildFiles.getFilesWithPlatform] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.files) throw new Error('options.files is required.');
    if (!options.environment) throw new Error('options.environment is required.');
  } catch (exception) {
    throw new Error(`[buildFiles.validateOptions] ${exception.message}`);
  }
};

const buildFiles = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);

    const filesWithPlatform = getFilesWithPlatform(options?.files);
    const copyFiles = filesWithPlatform?.filter((file) => file?.platform === 'copy');
    const browserFiles = filesWithPlatform?.filter((file) => file?.platform === 'browser');
    const nodeFiles = filesWithPlatform?.filter((file) => file?.platform === 'node');
    
    handleCopyFiles(copyFiles, options?.outputPath);
    
    const fileResults = await Promise.all([
      handleBuildForBrowser(browserFiles, options).then(() => {
        return { success: true };
      }).catch((exception) => {
        const file = handleParseFilePathFromException(exception);
        const snippet = handleBuildException(exception, file);
        
        return {
          success: false,
          path: file,
          error: {
            stack: exception?.stack,
            snippet,
          },
        };
      }),
      handleBuildForNode(nodeFiles, options).catch((exception) => {
        const file = handleParseFilePathFromException(exception);
        const snippet = handleBuildException(exception, file);
        
        return {
          success: false,
          path: file,
          error: {
            stack: exception?.stack,
            snippet,
          },
        };
      }),
    ]);
    
    if (options?.environment !== 'development') {
      await Promise.all([browserFiles, nodeFiles].map((file) => {
        return minifyFile(`${options?.outputPath || "./.joystick/build"}/${file.path}`);
      })); 
    }
    
    resolve(fileResults);
  } catch (exception) {
    reject(`[buildFiles] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    buildFiles(options, { resolve, reject });
  });

