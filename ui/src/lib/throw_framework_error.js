const throw_framework_error = (source = '', error = new Error()) => {
	throw new Error(`[joystick${source ? `.${source}` : ''}] ${error.message || error}`);
};

export default throw_framework_error;
