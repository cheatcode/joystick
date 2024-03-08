const wait = (seconds = 0) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, seconds * 1000);
	});
};

export default wait;
