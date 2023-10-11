export default (provision_server = 'production') => {
	return {
		development: 'http://localhost:2603',
		staging: 'https://staging.push-provision.cheatcode.co',
		production: 'https://push-provision.cheatcode.co',
	}[provision_server];
};
