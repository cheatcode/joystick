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

export const NODE_CRON_EVERY_FIVE_SECONDS = '*/5 * * * * *';
export const NODE_CRON_EVERY_TEN_SECONDS = '*/10 * * * * *';
export const NODE_CRON_EVERY_FIFTEEN_SECONDS = '*/15 * * * * *';
export const NODE_CRON_EVERY_THIRTY_SECONDS = '*/30 * * * * *';
export const NODE_CRON_EVERY_MINUTE = '* * * * *';

const constants = {
	HTML_ENTITY_MAP,
	KILOBYTE,
	MEGABYTE,
};

export default constants;
