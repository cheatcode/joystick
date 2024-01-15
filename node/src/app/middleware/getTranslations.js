import fs from 'fs';
import importFile from '../../lib/importFile.js';
import { isObject } from "../../validation/lib/typeValidators.js";
import settings from "../../settings/index.js";

const { readdir } = fs.promises;

const getTranslationsFile = async (languageFilePath = '', paths = '') => {
  const languageFile = await importFile(`${paths.build}/i18n/${languageFilePath}`);
  const isValidLanguageFile = languageFile && isObject(languageFile);

  if (isValidLanguageFile) {
    const translationsForPage = languageFile[paths.page];
    return translationsForPage ? translationsForPage : languageFile;
  }

  return {};
};

const getLanguagePreferenceRegexes = (userLanguage = '', browserLanguages = []) => {
  let languagePreferences = [];

  if (userLanguage) {
    languagePreferences.push(userLanguage);
  }

  const filteredBrowserLanguages = browserLanguages?.filter((language) => {
    return !language?.includes('*');
  });

  languagePreferences.push(...filteredBrowserLanguages);
  languagePreferences.push(settings?.config?.i18n?.defaultLanguage);

  return languagePreferences?.flatMap((language) => {
    const variants = [language];

    if (language?.length === 2) {
      variants.push(`${language.substring(0, 2)}-`);
    }

    if (language?.length > 2) {
      variants.push(`${language?.split('-')[0]}`);
      variants.push(`${language?.split('-')[0]}-`);
    }

    return variants;
  })?.map((languageString) => {
    const lastCharacter = languageString[languageString.length - 1];

    if (lastCharacter === '-') {
      return new RegExp(`^${languageString}[A-Z]+.js`, 'g');
    }

    return new RegExp(`^${languageString}.js`, 'g');
  });
};

const parseBrowserLanguages = (languages = '') => {
  const rawLanguages = languages.split(',');
  return rawLanguages?.map((rawLanguage) => rawLanguage.split(';')[0]);
};

export default async (paths = {}, req = {}) => {
  const languageFiles = await readdir(`${paths.build}/i18n`);
  const browserLanguages = parseBrowserLanguages(req?.headers['accept-language']);
  const languagePreferences = getLanguagePreferenceRegexes(req?.context?.user?.language, browserLanguages);

  let matchingFile = null;

  for (let i = 0; i < languagePreferences.length; i += 1) {
    const languageRegex = languagePreferences[i];
    const match = languageFiles.find((languageFile) => !!languageFile.match(languageRegex));

    if (match) {
      matchingFile = match;
      break;
    }
  }

  const translationsFile = await getTranslationsFile(matchingFile, paths);

  return translationsFile;
};