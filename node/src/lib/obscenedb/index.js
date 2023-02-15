import fs from 'node:fs';
import debounce from './debounce.js';

class ObsceneDB {
  constructor(options = {}) {
    this.options = options;

    if (!fs.existsSync(this.options.file)) {
      fs.writeFileSync(this.options.file, JSON.stringify(this.options.collections || {}));
    }

    this.db = JSON.parse(fs.readFileSync(this.options.file, 'utf-8'));
    this.writeToDisk = debounce(this._writeToDisk.bind(this), 300);
  }

  _writeToDisk() {
    fs.writeFile(this.options?.file, JSON.stringify(this.db), () => {});
  }

  collection(name = '') {
    if (this?.db && !this?.db[name]) {
      this.db[name] = [];
      this.writeToDisk();
    }
  }

  collectionExists(name = '') {
    return this?.db && !!this?.db[name];
  }

  find(collection = '', filter_function = null, options = {}) {
    const existingCollection = this.db[collection];

    if (existingCollection) {
      const sortedOptions = options?.sortBy && typeof options.sortBy === 'function' ? options.sortBy(existingCollection) : existingCollection;
      return !options?.limit ? sortedOptions.filter(filter_function) : sortedOptions.filter(filter_function)?.slice(0, options?.limit);
    }

    return [];
  }

  findOne(collection = '', filter_function = null, options = {}) {
    const [result = null] = this.find(collection, filter_function, { ...options, limit: 1 });
    return result;
  }

  insert(collection = '', data = {}) {
    const existingCollection = this.db[collection];

    if (existingCollection) {
      existingCollection.push(data);
      this.writeToDisk();
      return true;
    }

    this.db[collection] = [data];
    this.writeToDisk();
    return true;
  }

  remove(collection = '', filter_function = null) {
    const existingCollection = this.db[collection];

    if (existingCollection) {
      this.db[collection] = existingCollection.filter(filter_function);
      this.writeToDisk();
      return true;
    }

    return false;
  }
}

export default ObsceneDB;