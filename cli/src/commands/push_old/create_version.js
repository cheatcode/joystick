import fetch from 'node-fetch';

const create_version = (options = {}) => {
	return fetch(`${options?.push_provision_domain}/api/versions/${options?.domain}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-push-session-token': options?.session_token,
		},
		body: JSON.stringify(options?.body),
	})?.then(async (response) => {
		// NOTE: We only care about the response body here so parse it out and return it.
		const data = await response.json();
		return data?.data;
	}).catch((error) => {
		console.warn(error);
	});
};

export default create_version;
