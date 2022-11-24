import { isFunction, isObject } from "../lib/types";

class Cache {
  constructor(cacheName = '', defaultValue = {}) {
    this.name = cacheName;
    this.value = defaultValue || {};
    this.listeners = {
      change: [],
      set: [],
      unset: [],
    };
  }

  _getValueAtPath(path = '') {
    return path?.split('.').reduce((value = null, pathPart = '') => {
      if (value[pathPart]) {
        value = value[pathPart];
      }
      
      return value;
    }, this.value);
  }

  get(path = '') {
    if (path?.trim() === '') {
      return {
        ...(this.value || {}),
      };
    }

    return this._getValueAtPath(path);
  }

  set(callback = null, event = '') {
    if (!callback || !isFunction(callback)) {
      throw new Error('First argument passed to set() must be a function.');
    }

    const updatedValue = callback(this.value);

    if (!isObject(updatedValue)) {
      throw new Error('Value to set must be an object representing the current cache state.');
    }
    
    this.value = updatedValue;
    this._handleEvent(event, 'set');
    this._handleEvent(event, 'change');
  }

  unset(path = '', event = '') {
    if (path?.trim() === '') {
      this.value = {};
    }

    // NOTE: Adapted from https://youmightnotneed.com/lodash#unset
    const pathArray = path?.split('.');
    const keyToDeleteIndex = pathArray?.length - 1; 

    pathArray.reduce((updatedValue, key, i) => {
      if (i === keyToDeleteIndex) delete updatedValue[key];
      return updatedValue[key];
    }, this.value);

    this._handleEvent(event, 'unset');
    this._handleEvent(event, 'change');
  }

  on(event = '', callback = null) {
    if (!['change', 'set', 'unset'].includes(event)) {
      throw new Error(`Event to listen for must be change, set, or unset. ${event} is not supported.`);
    }

    if (!callback || !isFunction(callback)) {
      throw new Error('Second argument passed to on('<event>') must be a function.');
    }

    this.listeners = {
      [event]: [
        ...(this.listeners[event] || []),
        callback,
      ],
    };
  }

  _handleEvent(event = '', typeOfChange = '') {
    const listeners = this.listeners[typeOfChange] || [];

    for (let i = 0; i < listeners?.length; i += 1) {
      const listener = listeners[i];

      if (isFunction(listener)) {
        listener(this.value, event, typeOfChange);
      }
    }
  }
}

export default Cache;
