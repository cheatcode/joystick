const parse_json = (string = '') => {
	try {
		return JSON.parse(string);
	} catch {
		return {};
	}
};

export default parse_json;
