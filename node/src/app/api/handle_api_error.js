import format_api_error from "./format_api_error.js";
import types from "../../lib/types.js";

const handle_api_error = (location = '', error = '', res = {}) => {
	// NOTE: This is an internal Joystick error that we control. Should be
	// in the shape of { errors: [] } pre-formatted.
	if (types.is_object(error) && !(error instanceof Error)) {
    return res.status((error?.errors && error?.errors[0]?.status) || 500).send(
      JSON.stringify(error)
    );
	}

	if (error instanceof Error) {
		return res.status(500).send(
      JSON.stringify({
      	errors: [format_api_error(error, location, 500)]
      })
    );
	}

	return res.status(500).send(
    JSON.stringify({
    	errors: [format_api_error(new Error(error), location, 500)]
    })
  );
};

export default handle_api_error;
