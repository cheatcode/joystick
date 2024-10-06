const get_provision_domain = (provision_server = 'production') => {
	return {
		development: 'http://localhost:2603',
		staging: 'https://staging.provision.cheatcode.co',
		production: 'https://provision.cheatcode.co',
	}[provision_server];
};

export default get_provision_domain;
