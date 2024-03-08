import has_required_options from "./has_required_options.js";
import required_options from "./required_options.js";
import throw_framework_error from "../../lib/throw_framework_error.js";

const validate_component_options = (component_options = {}) => {
	const missing_required_options = has_required_options(component_options);

	if (missing_required_options) {
		throw_framework_error(
			'joystick.validate_component_options',
			new Error(`Component options must include:\n\n${required_options.join("\n")}`)
		);
	}
};

export default validate_component_options;
