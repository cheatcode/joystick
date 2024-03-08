export const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export const KILOBYTE = 1000;
export const MEGABYTE = KILOBYTE * 1000;

const constants = {
	HTML_ENTITY_MAP,
	KILOBYTE,
	MEGABYTE,
};

export default constants;
