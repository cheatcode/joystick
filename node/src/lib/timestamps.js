const timestamps = {
	get_database_format: (db_connection = null) => {
		if (!db_connection) return 'mongodb'; // Default to MongoDB format
		
		// Try to detect the database type
		if (db_connection.provider) {
			return db_connection.provider === 'postgresql' ? 'postgresql' : 'mongodb';
		}
		
		// Fall back to checking if it's a MongoDB collection
		if (typeof db_connection.collection === 'function') {
			return 'mongodb';
		}
		
		// Fall back to checking if it's a PostgreSQL client
		if (typeof db_connection.query === 'function') {
			return 'postgresql';
		}
		
		return 'mongodb'; // Default to MongoDB format
	},	
  // Base ISO string timestamp
  get_iso_string: (date = new Date()) => {
    return date.toISOString();
  },
  
  // Current time in various formats
  get_current_time: (options = {}) => {
    const now = new Date();
    
    if (options?.format === 'mongodb') {
      return now; // MongoDB expects Date objects
    } else if (options?.format === 'postgresql') {
      return now.toISOString(); // PostgreSQL works with ISO strings
    } else {
      return now.toISOString(); // Default to ISO string
    }
  },
  
  // For MongoDB specifically
  get_mongodb_date: (date = new Date()) => {
    return date; // MongoDB uses native Date objects
  },
  
  // For PostgreSQL specifically
  get_postgresql_date: (date = new Date()) => {
    return date.toISOString(); // PostgreSQL works with ISO strings
  },
  
  // Normalize date input to the correct format based on database type
  normalize_date: (date_input, options = {}) => {
    // If null/undefined, return current time formatted appropriately
    if (date_input == null) {
      const now = new Date();
      if (options?.format === 'mongodb') {
        return now;
      } else if (options?.format === 'postgresql') {
        return now.toISOString();
      } else {
        return now.toISOString(); // Default to ISO string
      }
    }
    
    let date;
    
    // Handle various input formats
    if (date_input instanceof Date) {
      date = date_input;
    } else if (typeof date_input === 'string') {
      // Try to parse the string as a date
      date = new Date(date_input);
      // If invalid date, use current time
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    } else if (typeof date_input === 'number') {
      // Handle timestamp numbers
      date = new Date(date_input);
      // If invalid timestamp, use current time
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    } else {
      // For any other input, use current time
      date = new Date();
    }
    
    // Return in the correct format based on database type
    if (options?.format === 'mongodb') {
      return date;
    } else if (options?.format === 'postgresql') {
      return date.toISOString();
    } else {
      return date.toISOString(); // Default to ISO string
    }
  },
  
  // Future time calculations with format control
  get_future_time: (unit = '', quantity = 0, options = {}) => {
    const date = options?.start_from ? new Date(options?.start_from) : new Date();

    switch (unit) {
      case 'seconds':
        date.setSeconds(date.getSeconds() + quantity);
        break;
      case 'minutes':
        date.setMinutes(date.getMinutes() + quantity);
        break;
      case 'hours':
        date.setHours(date.getHours() + quantity);
        break;
      case 'days':
        date.setHours(date.getHours() + (quantity * 24));
        break;
    }
    
    if (options?.format === 'mongodb') {
      return date; // Return Date object for MongoDB
    } else if (options?.format === 'postgresql') {
      return date.toISOString(); // Return ISO string for PostgreSQL
    } else {
      return date.toISOString(); // Default to ISO string
    }
  },
  
  // Past time calculations with format control
  get_past_time: (unit = '', quantity = 0, options = {}) => {
    const date = options?.start_from ? new Date(options?.start_from) : new Date();

    switch (unit) {
      case 'seconds':
        date.setSeconds(date.getSeconds() - quantity);
        break;
      case 'minutes':
        date.setMinutes(date.getMinutes() - quantity);
        break;
      case 'hours':
        date.setHours(date.getHours() - quantity);
        break;
      case 'days':
        date.setHours(date.getHours() - (quantity * 24));
        break;
    }
    
    if (options?.format === 'mongodb') {
      return date; // Return Date object for MongoDB
    } else if (options?.format === 'postgresql') {
      return date.toISOString(); // Return ISO string for PostgreSQL
    } else {
      return date.toISOString(); // Default to ISO string
    }
  }
};

export default timestamps;