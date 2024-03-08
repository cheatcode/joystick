const is_valid_json = (string = '') => {
	try {
		JSON.parse(string);
		return true;
	} catch {
		return false;
	}
};

export default is_valid_json;
