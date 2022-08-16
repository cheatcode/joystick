import fs from "fs";
import { createRequire } from "module";
import ssr from "../../ssr/index.js";
import { isObject } from "../../validation/lib/typeValidators";
import settings from "../../settings";
import generateErrorPage from "../../lib/generateErrorPage.js";
import replaceFileProtocol from "../../lib/replaceFileProtocol.js";
import replaceBackslashesWithForwardSlashes from "../../lib/replaceBackslashesWithForwardSlashes.js";
import getBuildPath from "../../lib/getBuildPath.js";
const require2 = createRequire(import.meta.url);
const getUrl = (request = {}) => {
  const [path = null] = request.url?.split("?");
  return {
    params: request.params,
    query: request.query,
    route: request.route.path,
    path
  };
};
const getFile = async (buildPath = "") => {
  const file = await import(buildPath);
  return file.default;
};
const getTranslations = async (buildPath = "", pagePath = "", user = {}) => {
  const defaultLanguage = user?.language || settings?.config?.i18n?.defaultLanguage;
  const hasDefaultLanguageFile = fs.existsSync(`${buildPath}/i18n/${defaultLanguage}.js`);
  const language = user?.language;
  const hasLanguageFile = fs.existsSync(`${buildPath}/i18n/${language}.js`);
  if (hasLanguageFile) {
    const languageFile = await getFile(`${buildPath}/i18n/${language}.js`);
    const isValidLanguageFile = languageFile && isObject(languageFile);
    if (isValidLanguageFile) {
      const translationsForPage = languageFile[pagePath];
      return translationsForPage ? translationsForPage : languageFile;
    }
  }
  if (hasDefaultLanguageFile) {
    const defaultLanguageFile = await getFile(`${buildPath}/i18n/${defaultLanguage}.js`);
    const isValidDefaultLanguageFile = defaultLanguageFile && isObject(defaultLanguageFile);
    if (isValidDefaultLanguageFile) {
      const translationsForPage = defaultLanguageFile[pagePath];
      return translationsForPage ? translationsForPage : defaultLanguageFile;
    }
  }
  return {};
};
var render_default = (req, res, next) => {
  res.render = async function(path = "", options = {}) {
    const buildPathForEnvironment = getBuildPath();
    const buildPath = replaceFileProtocol(replaceBackslashesWithForwardSlashes(`${process.cwd().replace(buildPathForEnvironment, "")}/${buildPathForEnvironment}`));
    const pagePath = `${buildPath}${path}`;
    const layoutPath = options.layout ? `${buildPath}${options.layout}` : null;
    if (!fs.existsSync(pagePath)) {
      return res.status(404).send(generateErrorPage({
        type: "pageNotFound",
        path: `res.render('${path}')`,
        frame: null,
        stack: `A page component at the path ${path} could not be found.`
      }));
    }
    if (layoutPath && !fs.existsSync(layoutPath)) {
      return res.status(404).send(generateErrorPage({
        type: "layoutNotFound",
        path: `res.render('${path}', { layout: '${options.layout}' })`,
        frame: null,
        stack: `A layout component at the path ${options.layout} could not be found.`
      }));
    }
    const pageFile = await getFile(pagePath);
    const Page = pageFile;
    const layoutFile = layoutPath ? await getFile(layoutPath) : null;
    const Layout = layoutFile;
    const translations = await getTranslations(buildPath, path, req?.context?.user);
    const url = getUrl(req);
    const props = { ...options?.props || {} };
    if (layoutPath && fs.existsSync(layoutPath)) {
      props.page = Page;
    }
    const html = await ssr({
      Component: Layout || Page,
      props,
      path: path?.substring(0, 1) === "/" ? path?.replace("/", "") : path,
      url,
      translations,
      layout: options.layout,
      head: options.head,
      req
    });
    return res.status(200).send(html);
  };
  next();
};
export {
  render_default as default
};
