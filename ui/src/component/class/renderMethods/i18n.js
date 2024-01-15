import throwFrameworkError from "../../../lib/throwFrameworkError";
import windowIsUndefined from "../../../lib/windowIsUndefined";

const replacePlaceholdersInString = (string = '', replacementsAsArray = []) => {
  try {
    return replacementsAsArray.reduce((translation, [replacementKey, replacementValue]) => {
      return translation.replace(`{{${replacementKey}}}`, replacementValue);
    }, string);
  } catch (exception) {
    throwFrameworkError('component.renderMethods.i18n.replacePlaceholdersInString', exception);
  }
};

const handleTranslationReplacement = (translation = '', replacementsAsArray = []) => {
  try {
    const translationIsString = typeof translation === 'string';
    const translationIsArray = Array.isArray(translation);
    const translationIsObject = typeof translation === 'object' && !translationIsArray;

    if (translationIsString) {
      return replacePlaceholdersInString(translation, replacementsAsArray);
    }

    if (translationIsArray) {
      return translation?.map((translationInArray) => {
        return handleTranslationReplacement(translationInArray, replacementsAsArray);
      });
    }

    if (translationIsObject) {
      return Object.entries(translation)?.reduce((objectWithReplacements = {}, [key, value]) => {
        objectWithReplacements[key] = handleTranslationReplacement(value, replacementsAsArray);
        return objectWithReplacements;
      }, {});
    }
  } catch (exception) {
    throwFrameworkError('component.renderMethods.i18n.handleTranslationReplacement', exception);
  }
};

const getTranslationAtPath = (key = '', translations = {}) => {
  try {
    return key?.split('.').reduce((objectToTraverse, keyToMatch)=> {
      return (objectToTraverse && objectToTraverse[keyToMatch]) || '';
    }, translations);
  } catch (exception) {
    throwFrameworkError('component.renderMethods.i18n.getTranslationAtPath', exception);
  }
};

const i18n = function(key = '', replacements = {}) {
  try {
    const translations = !windowIsUndefined() ? window.__joystick_i18n__ : this.translations;
    const isDotNotationPath = key?.includes('.');
    const translation = isDotNotationPath ? getTranslationAtPath(key, translations) : translations[key];

    if (!translations || !translation) {
      return '';
    }

    const replacementsAsArray = Object.entries(replacements);

    return handleTranslationReplacement(translation, replacementsAsArray);
  } catch (exception) {
    throwFrameworkError('component.renderMethods.i18n', exception);
  }
};

export default i18n;
