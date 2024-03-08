/**
 * nested-object-diff
 * https://github.com/eraykose/nested-object-diff
 */

class Diff {
  constructor(type, path) {
    this.type = type;
    this.path = path ? path.toString() : '';
  }
};

class EditDiff extends Diff {
  constructor(path, original, current) {
    super('E', path);

    this.original = original;
    this.current = current;
  }
};

class DiffMoved extends Diff {
  constructor(path, item, original_index, current_index) {
    super('M', path);

    this.item = item;
    this.original_index = original_index;
    this.current_index = current_index;
  }
};

class DeleteDiff extends Diff {
  constructor(path, original) {
    super('D', path);

    this.original = original;
  }
};

class NewDiff extends Diff {
  constructor(path, current) {
    super('A', path);

    this.current = current;
  }
};

const get_path = (current_path, key) => {
  return current_path ? `${current_path}.${key}` : key;
};

const diff = (original, current, options = {}) => {
  const diff_data = [];
  const match_key = options.match_key;
  const types = options.types || ['E', 'A', 'D', 'M'];

  const nested_diff_match = (original_data, current_data, current_path, match_key) => {
    original_data.forEach((original_item, original_item_index) => {
      const current_found_item_index = current_data.findIndex(
        current_item => current_item[match_key] === original_item[match_key]
      );

      if (current_found_item_index > -1) {
        if (types.indexOf('M') > -1 && original_item_index !== current_found_item_index) {
          diff_data.push(
            new DiffMoved(current_path, original_item, original_item_index, current_found_item_index)
          );
        }

        nested_diff(
          original_item,
          current_data[current_found_item_index],
          get_path(current_path, current_found_item_index)
        );
      } else if (types.indexOf('D') > -1) {
        diff_data.push(new DeleteDiff(current_path, original_item));
      }
    });

    current_data.forEach((current_item, key) => {
      const original_found_item_index = original_data.findIndex(
        original_item => current_item[match_key] === original_item[match_key]
      );

      if (types.indexOf('A') > -1 && original_found_item_index === -1) {
        diff_data.push(new NewDiff(get_path(current_path, key), current_item));
      }
    });
  };

  const nested_diff = (original_data, current_data, current_path) => {
    const typeof_original_data = Object.prototype.toString.call(original_data);
    const typeof_current_data = Object.prototype.toString.call(current_data);

    if (types.indexOf('E') > -1 && typeof_original_data !== typeof_current_data) {
      diff_data.push(new EditDiff(current_path, original_data, current_data));
      return false;
    }

    if (typeof_original_data === '[object Object]') {
      Object.getOwnPropertyNames(original_data).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(current_data, key)) {
          nested_diff(original_data[key], current_data[key], get_path(current_path, key));
        } else if (types.indexOf('D') > -1) {
          diff_data.push(new DeleteDiff(get_path(current_path, key), original_data[key]));
        }
      });

      Object.getOwnPropertyNames(current_data).forEach(key => {
        if (
          types.indexOf('A') > -1 &&
          !Object.prototype.hasOwnProperty.call(original_data, key)
        ) {
          diff_data.push(new NewDiff(get_path(current_path, key), current_data[key]));
        }
      });
    } else if (typeof_original_data === '[object Array]') {
      if (!match_key) {
        let original_data_length = original_data.length - 1;
        let current_data_length = current_data.length - 1;

        if (types.indexOf('D') > -1) {
          while (original_data_length > current_data_length) {
            diff_data.push(
              new DeleteDiff(
                get_path(current_path, original_data_length),
                original_data[original_data_length--]
              )
            );
          }
        }

        if (types.indexOf('A') > -1) {
          while (current_data_length > original_data_length) {
            diff_data.push(
              new NewDiff(
                get_path(current_path, current_data_length),
                current_data[current_data_length--]
              )
            );
          }
        }

        for (; original_data_length >= 0; --original_data_length) {
          nested_diff(
            original_data[original_data_length],
            current_data[original_data_length],
            get_path(current_path, original_data_length)
          );
        }
      } else {
        nested_diff_match(original_data, current_data, current_path, match_key);
      }
    } else if (types.indexOf('E') > -1 && original_data !== current_data) {
      diff_data.push(new EditDiff(current_path, original_data, current_data));
    }
  };

  nested_diff(original, current);

  return diff_data;
};

export default diff;
