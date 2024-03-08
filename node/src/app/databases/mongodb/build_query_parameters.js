import available_query_parameters from "./available_query_parameters.js";

const build_query_parameters = (connection = {}) => {
  const query_parameters = {};

  for (let i = 0; i < available_query_parameters.length; i += 1) {
    const available_parameter = available_query_parameters[i];

    if (connection && connection[available_parameter]) {
      query_parameters[available_parameter] = connection[available_parameter];
    }
  }

  return query_parameters;
};

export default build_query_parameters;
