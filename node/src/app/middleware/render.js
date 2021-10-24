import fs from "fs";
import ssr from "../../ssr/index.js";
import { isObject } from "../../validation/lib/typeValidators";
import settings from "../../settings";

const getUrl = (request = {}) => {
  return {
    params: request.params,
    query: request.query,
    route: request.route.path,
  };
};

const getTranslations = (buildPath = "", pagePath = "", user = {}) => {
  const defaultLanguage =
    user?.language || settings?.config?.i18n?.defaultLanguage;
  const hasDefaultLanguageFile = fs.existsSync(
    `${buildPath}/i18n/${defaultLanguage}.js`
  );

  const language = user?.language;
  const hasLanguageFile = fs.existsSync(`${buildPath}/i18n/${language}.js`);

  if (hasLanguageFile) {
    const languageFile = require(`${buildPath}/i18n/${language}.js`);
    const isValidLanguageFile = languageFile && isObject(languageFile);

    if (isValidLanguageFile) {
      const translationsForPage = languageFile[pagePath];
      return translationsForPage ? translationsForPage : languageFile;
    }
  }

  if (hasDefaultLanguageFile) {
    const defaultLanguageFile = require(`${buildPath}/i18n/${defaultLanguage}.js`);
    const isValidDefaultLanguageFile =
      defaultLanguageFile && isObject(defaultLanguageFile);

    if (isValidDefaultLanguageFile) {
      const translationsForPage = defaultLanguageFile[pagePath];
      return translationsForPage ? translationsForPage : defaultLanguageFile;
    }
  }

  return {};
};

const getFile = (buildPath = "") => {
  return require(buildPath);
};

export default (req, res, next) => {
  res.render = function (path = "", options = {}) {
    const buildPath = `${process.cwd()}/.joystick/build`;
    const pagePath = `${buildPath}/${path}`;
    const layoutPath = options.layout ? `${buildPath}/${options.layout}` : null;

    if (!fs.existsSync(pagePath)) {
      res.status(404).send(`404 — Page not found: ${path}`);
    }

    if (layoutPath && !fs.existsSync(layoutPath)) {
      res.status(404).send(`404 — Layout not found: ${options.layout}`);
    }

    const pageFile = getFile(pagePath);
    const Page = pageFile;
    const layoutFile = layoutPath ? getFile(layoutPath) : null;
    const Layout = layoutFile;

    const translations = getTranslations(buildPath, path, req.user);
    const url = getUrl(req);
    const props = { ...(options?.props || {}) };

    if (layoutPath && fs.existsSync(layoutPath)) {
      props.page = Page;
    }

    const html = ssr({
      Component: Layout || Page,
      props,
      path,
      url,
      translations,
      layout: options.layout,
    });

    return res.status(200).send(html);
  };

  next();
};
