import bootstrap_component from './bootstrap_component.js';
import generate_file_dependency_map from './generate_file_dependency_map.js';
import warn_node_environment from "./warn_node_environment.js";

const plugins = {
  bootstrap_component: {
    name: "bootstrap_component",
    setup(build) {
    	bootstrap_component(build);
    },
  },
  generate_file_dependency_map: {
    name: "generate_file_dependency_map",
    setup(build) {
    	generate_file_dependency_map(build);
    },
  },
  warn_node_environment: {
    name: "warn_node_environment",
    setup(build) {
      warn_node_environment(build);
    },
  },
};

export default plugins;
