const get_app_domain = (provision_server = 'production') => {
	// NOTE: Rely on provision_server CLI option flag here because that will need
	// to be paired with the appropriate app server.
	return {
		development: 'http://localhost:2600',
		staging: 'https://staging.push.cheatcode.co',
		production: 'https://push.cheatcode.co',
	}[provision_server];
};

export default get_app_domain;
