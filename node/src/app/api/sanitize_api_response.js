import escape_html from "../../lib/escape_html.js";
import types from '../../lib/types.js';

const sanitized_api_response = (data = null) => {
  let sanitized_data = data;

  if (
    !types.is_string(sanitized_data) &&
    !types.is_object(sanitized_data) &&
    !types.is_array(sanitized_data)
  ) {
    return sanitized_data;
  }

  if (types.is_string(sanitized_data)) {
    sanitized_data = (escape_html(sanitized_data))?.trim();
  }

  if (types.is_object(sanitized_data) && !types.is_array(sanitized_data)) {
    sanitized_data = Object.entries(sanitized_data || {})?.reduce((result = {}, [key, value]) => {
      result[key] = sanitized_api_response(value);
      return result;
    }, {});
  }

  if (types.is_array(sanitized_data)) {
    sanitized_data = sanitized_data.map((array_item = null) => {
      return sanitized_api_response(array_item);
    });
  }
  
  return sanitized_data;
};

export default sanitized_api_response;
