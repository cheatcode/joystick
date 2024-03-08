import types from "../lib/types.js";

class Cache {
  constructor(cache_name = '', default_value = {}) {
    this.name = cache_name;
    this.value = default_value || {};
    this.listeners = {
      change: [],
      set: [],
      unset: [],
    };
  }

  _get_value_at_path(path = '') {
    return path?.split('.').reduce((value = null, path_part = '') => {
      if (value[path_part]) {
        value = value[path_part];
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

    return this._get_value_at_path(path);
  }

  set(callback = null, user_event_label = '') {
    if (!callback || !types.is_function(callback)) {
      throw new Error('First argument passed to set() must be a function.');
    }

    const updated_value = callback(this.value);

    if (!types.is_object(updated_value)) {
      throw new Error('Value to set must be an object representing the current cache state.');
    }
    
    this.value = updated_value;
    this._handle_event('set', user_event_label);
    this._handle_event('change', user_event_label);
  }

  unset(path = '', user_event_label = '') {
    if (path?.trim() === '') {
      this.value = {};
    }

    // NOTE: Adapted from https://youmightnotneed.com/lodash#unset
    const path_array = path?.split('.');
    const key_to_delete_index = path_array?.length - 1; 

    path_array.reduce((updated_value, key, i) => {
      if (i === key_to_delete_index) delete updated_value[key];
      return updated_value[key];
    }, this.value);

    this._handle_event('unset', user_event_label);
    this._handle_event('change', user_event_label);
  }

  on(event = '', callback = null) {
    if (!['change', 'set', 'unset'].includes(event)) {
      throw new Error(`Event to listen for must be change, set, or unset. ${event} is not supported.`);
    }

    if (!callback || !types.is_function(callback)) {
      throw new Error('Second argument passed to on('<event>') must be a function.');
    }

    this.listeners = {
      [event]: [
        ...(this.listeners[event] || []),
        callback,
      ],
    };
  }

  _handle_event(internal_event_label = '', user_event_label = '') {
    const listeners = this.listeners[internal_event_label] || [];

    for (let i = 0; i < listeners?.length; i += 1) {
      const listener = listeners[i];

      if (types.is_function(listener)) {
        listener(this.value, internal_event_label, user_event_label);
      }
    }
  }
}

export default Cache;
