import fetch from 'node-fetch';

const validate_push_config = (options = {}) => {
	return fetch(`${options?.push_provision_domain}/api/validate/config`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(options?.push_config),
	})?.then(async (response) => {
		const data = await response.json();
		return data?.data;
	}).catch((error) => {
		console.warn(error);
	});
};

export default validate_push_config;
