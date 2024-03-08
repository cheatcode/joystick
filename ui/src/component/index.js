import Component from "./class.js";
import throw_framework_error from "../lib/throw_framework_error.js";

const component = (definition = {}) => {
	try {
		return (render_options = {}) => {
			return new Component({
				...definition,
				...render_options,
			})
		};
	} catch (error) {
		throw_framework_error('component', error);
	}
};

export default component;