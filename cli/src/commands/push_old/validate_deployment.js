import fetch from 'node-fetch';

const validate_deployment = (options = {}) => {
	return fetch(`${options?.push_provision_domain}/api/deployments/${options?.push_config?.domain}/validate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-push-session-token': options?.session_token,
		},
		body: JSON.stringify(options?.push_config),
	})?.then(async (response) => {
		const data = await response.json();
		return data?.data;
	}).catch((error) => {
		console.warn(error);
	});
};

export default validate_deployment;
