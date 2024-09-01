const get_push_domain = (push_server = 'production') => {
	return {
		development: 'http://localhost:2603',
		production: 'https://push.cheatcode.co',
	}[push_server];
};

export default get_push_domain;
