import fs from 'fs';
import load_settings from "../load_settings.js";
import types from '../types.js';
import dynamic_import from '../dynamic_import.js';

const { settings } = await load_settings(process.env.NODE_ENV);

const get_translations_file = async (language_file_path = '', joystick_build_path = '', render_component_path = '') => {
  const language_file = await dynamic_import(`${process.cwd()}/${joystick_build_path}/i18n/${language_file_path}?v=${new Date().getTime()}`);
  const is_valid_language_file = language_file && types.is_object(language_file);

  if (is_valid_language_file) {
    const translations_for_page = language_file[render_component_path];
    return translations_for_page ? translations_for_page : language_file;
  }

  return {};
};

const get_language_preference_regexes = (user_language = '', browser_languages = []) => {
  let language_preferences = [];

  if (user_language) {
    language_preferences.push(user_language);
  }

  const filtered_browser_languages = browser_languages?.filter((language) => {
    return !language?.includes('*');
  });

  language_preferences.push(...filtered_browser_languages);
  language_preferences.push(settings?.config?.i18n?.defaultLanguage);

  return language_preferences?.flatMap((language) => {
    const variants = [language];

    if (language?.length === 2) {
      variants.push(`${language.substring(0, 2)}-`);
    }

    if (language?.length > 2) {
      variants.push(`${language?.split('-')[0]}`);
      variants.push(`${language?.split('-')[0]}-`);
    }

    return variants;
  })?.map((language_string) => {
    const last_character = language_string[language_string?.length - 1];

    if (last_character === '-') {
      return new RegExp(`^${language_string}[A-Z]+.js`, 'g');
    }

    return new RegExp(`^${language_string}.js`, 'g');
  });
};

const parse_browser_languages = (languages = '') => {
  const raw_languages = languages.split(',');
  return raw_languages?.map((raw_language) => raw_language.split(';')[0]);
};

const get_translations = async (joystick_build_path = '', render_component_path = '', req = {}) => {
  const language_files = fs.readdirSync(`${joystick_build_path}/i18n`);
  const browser_languages = parse_browser_languages(req?.headers['accept-language']);
  const language_preferences = get_language_preference_regexes(req?.context?.user?.language, browser_languages);

  let matching_file = null;

  for (let i = 0; i < language_preferences.length; i += 1) {
    const language_regex = language_preferences[i];
    const match = language_files.find((language_file) => !!language_file.match(language_regex));

    if (match) {
      matching_file = match;
      break;
    }
  }

  const translations_file = await get_translations_file(matching_file, joystick_build_path, render_component_path);

  return translations_file;
};

export default get_translations;
