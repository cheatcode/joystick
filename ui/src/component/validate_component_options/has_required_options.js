import required_options from './required_options.js';

const has_required_options = (component_options = {}) => {
	return required_options.every((required_options) => {
		return Object.keys(component_options).includes(required_options);
	});
};

export default has_required_options;
