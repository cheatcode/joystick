import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";

const i18n = function i18n(key = '', replacements = {}) {
  try {
    const translations = !windowIsUndefined() ? window.__joystick_i18n__ : this.translations;

    if (!translations || !translations[key]) {
      return '';
    }

    const replacementsAsArray = Object.entries(replacements);

    if (replacementsAsArray.length > 0) {
      return replacementsAsArray.reduce((translation, [replacementKey, replacementValue]) => {
        return translation.replace(`{{${replacementKey}}}`, replacementValue);
      }, translations[key]); 
    }

    return translations[key];
  } catch (exception) {
    throwFrameworkError('component.renderMethods.i18n', exception);
  }
};

export default i18n;
