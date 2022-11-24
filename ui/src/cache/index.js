import throwFrameworkError from "../lib/throwFrameworkError";
import { isObject, isString } from "../lib/types";
import Cache from './class';

export default (cacheName = '', defaultValue = {}) => {
  try {
    if (!cacheName || cacheName && !isString(cacheName)) {
      throw new Error('Must pass a cache name as a string.');
    }

    if (defaultValue && !isObject(defaultValue)) {
      throw new Error('Default value for cache must be an object.'); 
    }

    return new Cache(cacheName, defaultValue);
  } catch (exception) {
    throwFrameworkError('cache', exception);
  }
};