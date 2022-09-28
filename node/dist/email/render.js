import fs from "fs";
import ssr from "../ssr";
import getBuildPath from "../lib/getBuildPath";
import { isObject } from "../validation/lib/typeValidators";
const getFile = async (buildPath = "") => {
  const file = await import(buildPath);
  return file.default;
};
const getTranslations = async (buildPath = "", templateName = "", user = {}, settings = {}) => {
  const language = user?.language || settings?.config?.i18n?.defaultLanguage;
  const languageFilePath = `${process.cwd()}/${buildPath}i18n/email/${templateName}_${language}.js`;
  const hasLanguageFile = fs.existsSync(languageFilePath);
  if (hasLanguageFile) {
    const languageFile = await getFile(languageFilePath);
    const isValidLanguageFile = languageFile && isObject(languageFile);
    return isValidLanguageFile ? languageFile : {};
  }
  return {};
};
var render_default = async ({
  templateName,
  baseName,
  settings,
  Component,
  props,
  subject,
  preheader,
  user
}) => {
  try {
    const buildPath = getBuildPath();
    const translations = await getTranslations(buildPath, templateName, user, settings);
    return ssr({
      email: true,
      emailSubject: subject,
      emailPreheader: preheader,
      componentFunction: Component,
      baseEmailHTMLName: baseName,
      props,
      translations
    });
  } catch (exception) {
    console.warn(exception);
  }
};
export {
  render_default as default
};
