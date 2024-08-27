import fetch from 'node-fetch';

const get_deployment = (options = {}) => {
	return fetch(`${options?.push_domain}/api/deployments/${options?.domain}`, {
		method: 'GET',
		headers: {
			'x-push-session-token': options?.session_token,
			Accept: 'application/json',
		},
	})?.then(async (response) => {
		// NOTE: We only care about the data in the response here so just return it.
		const data = await response.json();
		return data?.data;
	}).catch((error) => {
		console.warn(error);
	});
};

export default get_deployment;
