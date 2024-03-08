import Cache from './class.js';

export default (cacheName = '', defaultValue = {}) => {
  return new Cache(cacheName, defaultValue);
};