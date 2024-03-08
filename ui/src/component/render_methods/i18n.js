const replace_placeholders_in_string = (string = '', replacements_as_array = []) => {
  return replacements_as_array.reduce((translation, [replacement_key, replacement_value]) => {
    return translation.replace(`{{${replacement_key}}}`, replacement_value);
  }, string);
};

const handle_translation_replacement = (translation = '', replacements_as_array = []) => {
  const translation_is_string = typeof translation === 'string';
  const translation_is_array = Array.isArray(translation);
  const translation_is_object = typeof translation === 'object' && !translation_is_array;

  if (translation_is_string) {
    return replace_placeholders_in_string(translation, replacements_as_array);
  }

  if (translation_is_array) {
    return translation?.map((translation_in_array) => {
      return handle_translation_replacement(translation_in_array, replacements_as_array);
    });
  }

  if (translation_is_object) {
    return Object.entries(translation)?.reduce((object_with_replacements = {}, [key, value]) => {
      object_with_replacements[key] = handle_translation_replacement(value, replacements_as_array);
      return object_with_replacements;
    }, {});
  }
};

const get_translation_at_path = (key = '', translations = {}) => {
  return key?.split('.').reduce((object_to_traverse, key_to_match)=> {
    return (object_to_traverse && object_to_traverse[key_to_match]) || '';
  }, translations);
};

const i18n = function(key = '', replacements = {}) {
  const translations = typeof window !== 'undefined' ? window.__joystick_i18n__ : this.translations;
  const is_dot_notation_path = key?.includes('.');
  const translation = is_dot_notation_path ? get_translation_at_path(key, translations) : translations[key];

  if (!translations || !translation) {
    return '';
  }

  const replacements_as_array = Object.entries(replacements);

  return handle_translation_replacement(translation, replacements_as_array);
};

export default i18n;
