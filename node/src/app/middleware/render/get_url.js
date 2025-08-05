import escape_key_value_pair from "../../../lib/escape_key_value_pair.js";

const get_url = (request = {}) => {
  const [path = null] = request.url?.split('?');

  return {
    params: escape_key_value_pair(request.params),
    query: escape_key_value_pair(request.query),
    route: request.route.path,
    path: path,
  };
};

export default get_url;
