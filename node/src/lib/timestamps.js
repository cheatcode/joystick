const timestamps = {
	get_current_time: (options = {}) => {
		const timestamp = new Date().toISOString();
		return options?.mongodb_ttl ? new Date(timestamp) : timestamp;
	},
	get_future_time: (unit = '', quantity = 0, options = {}) => {
		const date = options?.start_from ? new Date(options?.start_from) : new Date();

		switch (unit) {
			case 'seconds':
				date.setSeconds(date.getSeconds() + quantity);
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			case 'minutes':
				date.setMinutes(date.getMinutes() + quantity);
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			case 'hours':
				date.setHours(date.getHours() + quantity);
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			case 'days':
				date.setHours(date.getHours() + (quantity * 24));
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			default:
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
		}
	},
	get_past_time: (unit = '', quantity = 0, options = {}) => {
		const date = options?.start_from ? new Date(options?.start_from) : new Date();

		switch (unit) {
			case 'seconds':
				date.setSeconds(date.getSeconds() - quantity);
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			case 'minutes':
				date.setMinutes(date.getMinutes() - quantity);
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			case 'hours':
				date.setHours(date.getHours() - quantity);
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			case 'days':
				date.setHours(date.getHours() - (quantity * 24));
				return options?.mongodb_ttl ? new Date(date.toISOString()) : date.toISOString();
			default:
				return options?.mongodb_ttl ? new Date(new Date().toISOString()) : new Date().toISOString();
		}
	},
};

export default timestamps;
