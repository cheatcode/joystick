import browser_path_exclusions from "./browser_path_exclusions.js";
import browser_paths from "./browser_paths.js";
import node_paths from "./node_paths.js";

const check_if_node_path = (path = '') => {
	return node_paths.some((node_path) => {
    return path.includes(node_path);
  });
};

const check_if_browser_path = (path = '') => {
  return browser_paths.some((browser_path) => {
    return path.includes(browser_path);
  }) && !browser_path_exclusions.some((browser_path_exclusion) => {
    return path.includes(browser_path_exclusion);
  });
};

const get_path_platform = (path = '') => {
	const is_browser_path = check_if_browser_path(path);
	const is_node_path = check_if_node_path(path);

	if (is_browser_path) {
		return 'browser';
	}

	if (is_node_path) {
		return 'node';
	}
};

export default get_path_platform;
