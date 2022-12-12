import sanitizeHTML from "sanitize-html";
import util from 'util';

const sanitizeAPIResponse = (data = null, sanitizerOptions = null) => {
  let sanitizedData = data;
  let customSanitizerOptions = util.isObject(sanitizerOptions) && !Array.isArray(sanitizerOptions) ? sanitizerOptions : null;

  if (
    !util.isString(sanitizedData) &&
    !util.isObject(sanitizedData) &&
    !Array.isArray(sanitizedData)
  ) {
    return sanitizedData;
  }

  if (util.isString(sanitizedData)) {
    sanitizedData = (sanitizeHTML(sanitizedData, customSanitizerOptions))?.trim();
  }

  if (util.isObject(sanitizedData) && !Array.isArray(sanitizedData)) {
    sanitizedData = Object.entries(sanitizedData)?.reduce((result = {}, [key, value]) => {
      result[key] = sanitizeAPIResponse(value, customSanitizerOptions);
      return result;
    }, {});
  }

  if (Array.isArray(sanitizedData)) {
    sanitizedData = sanitizedData.map((arrayItem = null) => {
      return sanitizeAPIResponse(arrayItem, customSanitizerOptions);
    });
  }
  
  return sanitizedData;
};

export default sanitizeAPIResponse;