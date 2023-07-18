import util from 'util';
import { HTML_ENTITY_MAP } from "../lib/constants.js";

const escapeHTML = (string = '') => {
  return String(string).replace(/[&<>"'`=\/]/g, function (match) {
    return HTML_ENTITY_MAP[match];
  });
};

const sanitizeAPIResponse = (data = null) => {
  let sanitizedData = data;

  if (
    !util.isString(sanitizedData) &&
    !util.isObject(sanitizedData) &&
    !Array.isArray(sanitizedData)
  ) {
    return sanitizedData;
  }

  if (util.isString(sanitizedData)) {
    sanitizedData = (escapeHTML(sanitizedData))?.trim();
  }

  if (util.isObject(sanitizedData) && !Array.isArray(sanitizedData)) {
    sanitizedData = Object.entries(sanitizedData)?.reduce((result = {}, [key, value]) => {
      result[key] = sanitizeAPIResponse(value);
      return result;
    }, {});
  }

  if (Array.isArray(sanitizedData)) {
    sanitizedData = sanitizedData.map((arrayItem = null) => {
      return sanitizeAPIResponse(arrayItem);
    });
  }
  
  return sanitizedData;
};

export default sanitizeAPIResponse;
