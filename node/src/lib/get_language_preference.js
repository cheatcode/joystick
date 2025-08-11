import load_settings from "../app/settings/load.js";

const settings = load_settings();

const parse_browser_languages = (languages = '') => {
  if (!languages) return [];
  const raw_languages = languages.split(',');
  return raw_languages?.map((raw_language) => raw_language.split(';')[0]);
};

const get_language_preference = (req = {}) => {
  // NOTE: Priority order: user.language, cookies.language, navigation.language, default_language
  
  // 1. User profile language (highest priority)
  if (req?.context?.user?.language) {
    return req.context.user.language;
  }
  
  // 2. Cookie language
  if (req?.cookies?.language) {
    return req.cookies.language;
  }
  
  // 3. Browser Accept-Language header
  const browser_languages = parse_browser_languages(req?.headers?.['accept-language']);
  if (browser_languages?.length > 0) {
    const filtered_browser_languages = browser_languages.filter((language) => {
      return !language?.includes('*');
    });
    
    if (filtered_browser_languages?.length > 0) {
      return filtered_browser_languages[0];
    }
  }
  
  // 4. Fallback to default language from settings
  return settings?.config?.i18n?.defaultLanguage || 
         settings?.config?.i18n?.default_language || 
         'en';
};

export default get_language_preference;
