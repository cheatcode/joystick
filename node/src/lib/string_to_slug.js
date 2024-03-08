const string_to_slug = (string = '') => {
	let slug = string.toLowerCase().trim();
  // Remove accents from charaters.
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // Replace invalid chars with spaces.
  slug = slug.replace(/[^a-z0-9\s-_]/g, ' ').trim();
  // Replace multiple spaces, hyphens, or underscores with a single hyphen/underscore.
  slug = slug.replace(/[\s-]+/g, '-');
  slug = slug.replace(/[\s_]+/g, '_');
  
  return slug;
};

export default string_to_slug;