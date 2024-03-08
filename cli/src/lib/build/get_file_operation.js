import copy_paths from "./copy_paths.js";

const check_if_is_copy_path = (path = '') => {
  return copy_paths.some((file_to_copy) => {
    return file_to_copy.regex.test(path);
  });
};

const check_if_is_javascript = (file_extension = '') => {
	return file_extension === 'js';
};

const get_file_operation = (path = '') => {
	const file_extension = path?.split('.')?.pop();
	const is_javascript = check_if_is_javascript(file_extension);
	const is_copy_path = check_if_is_copy_path(path);

	if (!is_javascript || (is_javascript && is_copy_path)) {
		return 'copy_file';
	}

	return 'build_file';
};

export default get_file_operation;
